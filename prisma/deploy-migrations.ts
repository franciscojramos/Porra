/**
 * Aplica migraciones pendientes en Turso (libsql) o SQLite local.
 * Prisma migrate deploy no acepta libsql:// con provider sqlite.
 */
import { createClient } from "@libsql/client";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

async function appliedMigrations(client: ReturnType<typeof createClient>) {
  try {
    const result = await client.execute(
      'SELECT migration_name FROM "_prisma_migrations" WHERE rolled_back_at IS NULL'
    );
    return new Set(result.rows.map((r) => String(r.migration_name)));
  } catch {
    return new Set<string>();
  }
}

async function deployTurso() {
  const url = process.env.DATABASE_URL!;
  const authToken = process.env.TURSO_AUTH_TOKEN || "";
  const client = createClient({ url, authToken });
  const applied = await appliedMigrations(client);
  const migrationsDir = join(process.cwd(), "prisma/migrations");
  const folders = readdirSync(migrationsDir)
    .filter((f) => f !== "migration_lock.toml" && !f.startsWith("."))
    .sort();

  let count = 0;
  for (const folder of folders) {
    if (applied.has(folder)) continue;
    const sqlPath = join(migrationsDir, folder, "migration.sql");
    const sql = readFileSync(sqlPath, "utf-8");
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await client.execute(statement);
    }

    await client.execute({
      sql: `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
            VALUES (?, ?, datetime('now'), ?, NULL, NULL, datetime('now'), 1)`,
      args: [folder, "deploy-migrations", folder],
    });
    console.log(`✓ ${folder}`);
    count++;
  }

  console.log(count === 0 ? "Sin migraciones pendientes" : `Aplicadas: ${count}`);
}

async function deployLocal() {
  const { execSync } = await import("child_process");
  execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
}

async function main() {
  const url = process.env.DATABASE_URL || "";
  if (url.startsWith("libsql://")) {
    await deployTurso();
    return;
  }
  await deployLocal();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

export default main;
