import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * API protegida para inicializar la BD en producción sin ejecutar scripts locales.
 * 
 * Uso (desde Postman, curl, o navegador):
 * GET  /api/admin/setup?token=TU_SETUP_SECRET_TOKEN
 * POST /api/admin/setup?token=TU_SETUP_SECRET_TOKEN
 * Body: { "action": "status" | "seed" | "scoring" }
 */

const SETUP_TOKEN = process.env.SETUP_SECRET_TOKEN;

async function runSeed() {
  // Importar lógica de seed directamente (más limpio que child_process)
  const seedModule = await import("@/../prisma/seed");
  if (typeof seedModule.default === "function") {
    await seedModule.default();
  }
}

async function runScoring() {
  const scoringModule = await import("@/../prisma/sync-scoring");
  if (typeof scoringModule.default === "function") {
    await scoringModule.default();
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!SETUP_TOKEN || token !== SETUP_TOKEN) {
    return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
  }

  try {
    const userCount = await prisma.user.count();
    const teamCount = await prisma.team.count();
    const matchCount = await prisma.match.count();
    const groupCount = await prisma.group.count();

    return NextResponse.json({
      success: true,
      status: "connected",
      database: {
        users: userCount,
        teams: teamCount,
        matches: matchCount,
        groups: groupCount,
      },
      hint: "POST con {action: 'seed'} para cargar datos iniciales",
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        error: "No se puede conectar a la BD", 
        details: error.message,
        hint: "Verifica DATABASE_URL en las variables de entorno"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!SETUP_TOKEN || token !== SETUP_TOKEN) {
    return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "status":
        const userCount = await prisma.user.count();
        const teamCount = await prisma.team.count();
        const matchCount = await prisma.match.count();

        return NextResponse.json({
          success: true,
          database: {
            users: userCount,
            teams: teamCount,
            matches: matchCount,
            connected: true,
          },
        });

      case "seed":
        await runSeed();
        return NextResponse.json({ 
          success: true, 
          message: "✅ Equipos, grupos y partidos cargados correctamente" 
        });

      case "scoring":
        await runScoring();
        return NextResponse.json({ 
          success: true, 
          message: "✅ Sistema de puntuación sincronizado" 
        });

      default:
        return NextResponse.json(
          { 
            error: "Acción no válida", 
            available: ["status", "seed", "scoring"],
            example: { action: "seed" }
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("❌ Error en setup:", error);
    return NextResponse.json(
      { 
        error: "Error ejecutando setup", 
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

