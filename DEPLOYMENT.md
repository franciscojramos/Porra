# Guía de Despliegue en Vercel

## 📋 Checklist Pre-Despliegue

### 1. Preparar Base de Datos en la Nube

**Opción A: Turso (Recomendada - SQLite)**

```bash
# Instalar CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Login
turso auth login

# Crear BD
turso db create porra-mundial

# Obtener URL y token
turso db show porra-mundial
```

Guarda estos valores:
- `DATABASE_URL`: `libsql://porra-mundial-xxx.turso.io`
- `TURSO_AUTH_TOKEN`: `eyJ...`

**Opción B: Neon (Postgres)**

1. Crear cuenta en [neon.tech](https://neon.tech)
2. Crear proyecto nuevo
3. Copiar `DATABASE_URL` (postgres://...)
4. Si usas Postgres, cambiar en `prisma/schema.prisma`:
   ```prisma
   provider = "postgresql"
   ```

### 2. Generar Secretos

```bash
# AUTH_SECRET (JWT)
openssl rand -base64 32

# SETUP_SECRET_TOKEN (para API de inicialización)
openssl rand -base64 32
```

---

## 🚀 Despliegue en Vercel

### Paso 1: Subir a GitHub

```bash
cd /home/fjrm/Escritorio/Porra
git add .
git commit -m "Preparar deploy para Vercel"
git push origin main
```

### Paso 2: Importar en Vercel

1. Ir a [vercel.com](https://vercel.com)
2. **New Project** → Importar tu repo de GitHub
3. Configurar variables de entorno:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DATABASE_URL` | `libsql://...` o `postgres://...` | URL de tu BD en la nube |
| `TURSO_AUTH_TOKEN` | `eyJ...` | Solo si usas Turso |
| `AUTH_SECRET` | Output de `openssl rand -base64 32` | Para firmar JWT |
| `ADMIN_USERNAME` | `admin` | Usuario administrador |
| `ADMIN_PASSWORD` | **Contraseña fuerte** | ⚠️ No uses `admin123` |
| `SETUP_SECRET_TOKEN` | Output de `openssl rand -base64 32` | Para proteger API de setup |

4. **Deploy**

### Paso 3: Inicializar Base de Datos

Una vez desplegado, desde tu navegador:

```bash
# 1. Verificar estado
GET https://tu-proyecto.vercel.app/api/admin/setup?token=TU_SETUP_SECRET_TOKEN

# 2. Cargar equipos y partidos
curl -X POST "https://tu-proyecto.vercel.app/api/admin/setup?token=TU_SETUP_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "seed"}'

# 3. Configurar puntuación
curl -X POST "https://tu-proyecto.vercel.app/api/admin/setup?token=TU_SETUP_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "scoring"}'

# 4. (Opcional) Importar pronósticos fase 1
curl -X POST "https://tu-proyecto.vercel.app/api/admin/setup?token=TU_SETUP_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "import"}'
```

O usa Postman / Thunder Client.

### Paso 4: Primer Login

1. Ir a `https://tu-proyecto.vercel.app/login`
2. Usuario: `admin` (el de `ADMIN_USERNAME`)
3. Contraseña: la de `ADMIN_PASSWORD`

---

## 🔐 Seguridad

### ✅ Configuración Correcta

- ✅ **AUTH_SECRET**: Largo y aleatorio (32+ caracteres)
- ✅ **ADMIN_PASSWORD**: Fuerte, única, nunca `admin123`
- ✅ **SETUP_SECRET_TOKEN**: Guárdalo seguro, solo para inicialización
- ✅ Cookies con `httpOnly: true` y `secure: true` en producción
- ✅ Headers de seguridad configurados en `vercel.json`

### ⚠️ Nunca Hagas Esto

- ❌ Subir `.env` a GitHub
- ❌ Poner secretos en el código
- ❌ Usar contraseñas débiles tipo `admin123`
- ❌ Dejar `SETUP_SECRET_TOKEN` expuesto públicamente

### 🧹 Después del Setup

Una vez inicializada la BD, **borra `SETUP_SECRET_TOKEN`** de las variables de entorno en Vercel o cambia su valor. Así nadie puede volver a ejecutar el setup.

---

## 🐛 Troubleshooting

### Error: "Cannot find module 'prisma'"

```bash
# En Vercel, asegúrate de tener:
"postinstall": "prisma generate"
```

### Error: "No DATABASE_URL"

Verifica que la variable esté bien escrita en el panel de Vercel (sin espacios, con el valor correcto).

### Error al conectar con Turso

Si usas Turso, necesitas AMBAS variables:
- `DATABASE_URL=libsql://...`
- `TURSO_AUTH_TOKEN=eyJ...`

### Migraciones no aplicadas

Las migraciones se aplican automáticamente en cada deploy con:
```bash
prisma migrate deploy
```

Si falla, revisa los logs de Vercel.

---

## 📊 Monitoreo

- **Logs**: Panel de Vercel → tu proyecto → Logs
- **BD**: Dashboard de Turso/Neon para ver consultas
- **Errores**: Vercel te notifica por email si hay crashes

---

## 🔄 Actualizaciones

Para desplegar cambios:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

Vercel redespliega automáticamente.

---

## 🎯 Próximos Pasos

1. ✅ Desplegar y verificar que funciona
2. ✅ Crear usuarios para tus amigos en Admin
3. ✅ Compartir URL + credenciales por grupo de WhatsApp
4. ✅ Disfrutar del Mundial 😎

---

## 💡 Mejoras Opcionales

- **Dominio propio**: Configurar en Vercel (ej. `porrita.io`)
- **Analytics**: Añadir Vercel Analytics o Google Analytics
- **Backup BD**: Turso/Neon tienen backups automáticos
- **Notificaciones**: Webhook cuando hay resultados nuevos
