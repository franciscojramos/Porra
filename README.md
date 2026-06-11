# Porra Mundial 2026

Aplicación web para hacer una porra del Mundial de fútbol entre amigos: pronósticos de grupos, eliminatorias, mejores terceros y premios individuales, con clasificación por puntos.

## Qué incluye

- **Inicio**: partido en juego o próximo (hora Madrid), calendario por día, clasificaciones reales de grupos
- **Detalle de partido** (`/partidos/73`): resultado, goleadores, pronósticos de cada jugador y puntos
- **Mi perfil**: todos tus pronósticos; confirmar los bloquea
- **Clasificación**: ranking por puntos; enlace al perfil de cada jugador
- **Jugadores**: ver pronósticos de cualquier participante
- **Mis grupos / Eliminatorias / Premios**: rellenar pronósticos (solo antes de confirmar)
- **8 mejores terceros**: solo entre los 3º que hayas predicho en cada grupo
- **Admin**: resultados reales, goleadores, usuarios y puntuación

## Requisitos

- Node.js 18+ (recomendado 20+)
- npm

## Uso en local (recomendado para empezar)

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar entorno
cp .env.example .env
# Edita .env y cambia AUTH_SECRET y ADMIN_PASSWORD

# 3. Crear base de datos y datos iniciales
npm run db:setup

# 4. Arrancar
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

**Credenciales iniciales** (las de tu `.env`):
- Usuario: `admin`
- Contraseña: la que pongas en `ADMIN_PASSWORD` (por defecto `admin123`)

### Flujo recomendado

**Admin (tú)**
1. Entra como **admin** → crea usuarios con contraseña
2. **Admin → Editar pronósticos** → rellenas la porra de cada amigo (o ellos la rellenan en borrador)
3. **Marcar completo** cuando esté lista → el usuario ya no puede cambiar nada
4. Durante el torneo: **Admin → Resultados reales** → se calculan los puntos de todos

**Cada jugador**
1. Entra con su usuario (creado por el admin)
2. Si está en **borrador**: rellena Grupos, Eliminatorias, Premios y marca completo en **Mi perfil**
3. Si está **completo**: solo puede ver sus pronósticos, no editarlos
4. Ve la **Clasificación** y los perfiles de los demás en **Jugadores**

## Despliegue en Vercel

SQLite funciona bien en local, pero **en Vercel necesitas una base de datos en la nube** (por ejemplo [Turso](https://turso.tech) o [Neon](https://neon.tech)).

Pasos generales:

1. Sube el proyecto a GitHub
2. Importa el repo en [vercel.com](https://vercel.com)
3. Configura variables de entorno:
   - `DATABASE_URL` → URL de Postgres/Turso
   - `AUTH_SECRET` → cadena larga aleatoria
   - `ADMIN_USERNAME` y `ADMIN_PASSWORD`
4. Cambia en `prisma/schema.prisma` el provider a `postgresql` si usas Postgres
5. Ejecuta migraciones contra la BD de producción
6. Despliega

Para empezar, **local es más sencillo**: solo `npm run dev` en tu PC y compartís la URL con un túnel (ngrok, Cloudflare Tunnel) si queréis probar desde el móvil.

## Puntuación oficial

Reglas completas en **`/reglas`** dentro de la app. Resumen:

**Fase 1 — Grupos:** 1X2 = 3 pts · exacto +2 · 2 clasificados sin orden = 4 · orden 1º-2º +3 · 3º = 2 · mejores terceros = 3 c/u (máx. 24).

**Fase 1 — Premios:** Joven / Balón / Guante = 15 c/u · Bota Top 3 = 10 por acierto · bonus orden exacto +10.

**Fase 2 — Eliminatorias:** Dieciseisavos/octavos 1X2 = 5 (+3 exacto) · Cuartos/semis 1X2 = 8 (+4 exacto). Marcador sobre 90' o 120', antes de penaltis.

**Fase 2 — Cuadro de honor:** 4º = 15 · 3º = 15 · Subcampeón = 25 · Campeón = 40.

El admin puede ajustar valores en **Admin → Configuración de puntos**. Sincronizar reglas por defecto: `npm run db:scoring`.

## Próximos pasos

- Integrar API de resultados en directo
- Bloquear edición de pronósticos tras el inicio del torneo
- Mejorar el cuadro de eliminatorias con cruces reales

## Scripts útiles

```bash
npm run dev          # desarrollo
npm run build        # compilar
npm run db:seed      # recargar equipos y partidos
npm run db:setup     # migración + seed
```
