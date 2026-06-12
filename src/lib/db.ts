import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || "";

  // Si es Turso (libsql://), usar el adaptador
  if (databaseUrl.startsWith("libsql://")) {
    const libsqlConfig = {
      url: databaseUrl,
      authToken: process.env.TURSO_AUTH_TOKEN || "",
    };
    const adapter = new PrismaLibSql(libsqlConfig);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  // Si es SQLite local (file:), usar directamente
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
