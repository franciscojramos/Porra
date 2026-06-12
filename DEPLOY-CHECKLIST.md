# ✅ Checklist Final de Despliegue

Sigue estos pasos **en orden** para desplegar tu porra en producción.

---

## 📦 Paso 1: Preparar el Código

```bash
cd /home/fjrm/Escritorio/Porra

# Ver cambios pendientes
git status

# Agregar todos los archivos (dev.db NO se subirá, está en .gitignore)
git add .

# Hacer commit
git commit -m "Listo para deploy en Vercel con API de setup"

# Subir a GitHub
git push origin main
```

---

## 🗄️ Paso 2: Crear Base de Datos (Turso - Recomendado)

```bash
# Instalar CLI de Turso
curl -sSfL https://get.tur.so/install.sh | bash

# Login en Turso
turso auth login

# Crear base de datos
turso db create porra-mundial

# Ver detalles (guarda estos valores)
turso db show porra-mundial
```

**Anota estos valores:**
- 📝 `DATABASE_URL`: `libsql://porra-mundial-xxx.turso.io`
- 📝 `TURSO_AUTH_TOKEN`: `eyJ...` (el token completo)

---

## 🔐 Paso 3: Generar Secretos

```bash
# AUTH_SECRET (para JWT)
openssl rand -base64 32

# SETUP_SECRET_TOKEN (para API de inicialización)
openssl rand -base64 32

# ADMIN_PASSWORD (contraseña fuerte)
# Usa un generador o invéntate una de 16+ caracteres
```

---

## 🚀 Paso 4: Deploy en Vercel

### 4.1 Crear Proyecto en Vercel

1. Ve a [vercel.com](https://vercel.com) y haz login con GitHub
2. Click en **"Add New..." → Project**
3. Busca tu repositorio `Porra` y haz click en **Import**

### 4.2 Configurar Variables de Entorno

En el paso de configuración, añade estas variables:

| Variable | Valor de Ejemplo | ⚠️ Importante |
|----------|------------------|---------------|
| `DATABASE_URL` | `libsql://porra-xxx.turso.io` | URL de Turso (paso 2) |
| `TURSO_AUTH_TOKEN` | `eyJh...` (muy largo) | Token de Turso (paso 2) |
| `AUTH_SECRET` | `Xy9k...` (32+ chars) | Output del openssl (paso 3) |
| `ADMIN_USERNAME` | `admin` | Tu usuario admin |
| `ADMIN_PASSWORD` | `TuContraseñaFuerte123!` | **NUNCA** uses `admin123` |
| `SETUP_SECRET_TOKEN` | `Ab12...` (32+ chars) | Output del openssl (paso 3) |

### 4.3 Desplegar

1. Click en **Deploy**
2. Espera 2-3 minutos
3. Vercel te dará una URL: `https://porra-xxx.vercel.app`

---

## 🎬 Paso 5: Inicializar Base de Datos

Una vez desplegado, abre tu navegador o Postman:

### 5.1 Verificar Conexión

```bash
GET https://tu-proyecto.vercel.app/api/admin/setup?token=TU_SETUP_SECRET_TOKEN
```

Deberías ver:
```json
{
  "success": true,
  "status": "connected",
  "database": {
    "users": 0,
    "teams": 0,
    "matches": 0,
    "groups": 0
  }
}
```

### 5.2 Cargar Equipos y Partidos

```bash
curl -X POST "https://tu-proyecto.vercel.app/api/admin/setup?token=TU_SETUP_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "seed"}'
```

Respuesta esperada:
```json
{
  "success": true,
  "message": "✅ Equipos, grupos y partidos cargados correctamente"
}
```

### 5.3 Configurar Sistema de Puntuación

```bash
curl -X POST "https://tu-proyecto.vercel.app/api/admin/setup?token=TU_SETUP_SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action": "scoring"}'
```

### 5.4 Verificar que Todo Está OK

```bash
GET https://tu-proyecto.vercel.app/api/admin/setup?token=TU_SETUP_SECRET_TOKEN
```

Ahora deberías ver:
```json
{
  "database": {
    "users": 1,
    "teams": 48,
    "matches": 104,
    "groups": 12
  }
}
```

---

## 🎉 Paso 6: Primer Login

1. Ve a: `https://tu-proyecto.vercel.app/login`
2. Usuario: `admin`
3. Contraseña: la que pusiste en `ADMIN_PASSWORD`

Si entra, ¡**FELICIDADES**! 🎊

---

## 👥 Paso 7: Crear Usuarios para tus Amigos

1. Una vez dentro, ve a **Admin**
2. En "Crear usuario" rellena:
   - Username: `javi`, `edu`, `marcosj`, etc.
   - Display Name: Nombre real
   - Password: Dásela a cada uno por privado

3. Repite para cada amigo

---

## 📱 Paso 8: Compartir con el Grupo

Envía por WhatsApp:

```
🏆 ¡La porra del Mundial ya está lista!

🌐 URL: https://tu-proyecto.vercel.app

Tu usuario: javi
Tu contraseña: (te la envío por privado)

Entra, rellena tus pronósticos y márcalos como completos 
antes de que empiece el torneo 💪

¡Suerte! ⚽
```

---

## 🔒 Paso 9: IMPORTANTE - Asegurar el Setup

Una vez inicializada la BD, **borra o cambia** `SETUP_SECRET_TOKEN`:

1. Ve al panel de Vercel → tu proyecto → Settings → Environment Variables
2. Edita `SETUP_SECRET_TOKEN` y cambia su valor o bórrala
3. Redeploy (Settings → Deployments → ... → Redeploy)

Así nadie podrá volver a ejecutar el setup aunque conozca la URL.

---

## ✅ Checklist Final

- [ ] Código subido a GitHub
- [ ] Base de datos Turso creada
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy exitoso
- [ ] API de setup ejecutada (seed + scoring)
- [ ] Login como admin funciona
- [ ] Usuarios creados para cada amigo
- [ ] URL compartida con el grupo
- [ ] `SETUP_SECRET_TOKEN` deshabilitado

---

## 🐛 ¿Algo falló?

### Error: "Unauthorized - Invalid token"
➡️ El `SETUP_SECRET_TOKEN` en Vercel no coincide con el que usas en la URL

### Error: "No se puede conectar a la BD"
➡️ Revisa que `DATABASE_URL` y `TURSO_AUTH_TOKEN` estén bien copiados (sin espacios extras)

### Error: Login no funciona
➡️ Verifica que `AUTH_SECRET` esté configurado en Vercel

### Los partidos no se ven
➡️ Ejecuta el setup: `POST /api/admin/setup?token=... {"action": "seed"}`

---

## 📊 Logs y Monitoreo

- **Ver logs**: Panel de Vercel → tu proyecto → Logs (en tiempo real)
- **Ver BD**: Dashboard de Turso para consultas SQL
- **Errores**: Vercel te notifica por email si hay crashes

---

## 🎯 ¡Listo!

Tu porra está en producción, accesible desde cualquier dispositivo, 
con base de datos persistente y lista para el Mundial 2026.

¿Dudas? Revisa los logs en Vercel o pregunta en el chat. 👍
