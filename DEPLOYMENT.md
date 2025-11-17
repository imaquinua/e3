# Guía de Deployment - E³ Content Generator

## ⚠️ Consideración Importante: Base de Datos

Esta aplicación usa **SQLite**, que **NO funciona en Vercel** (entornos serverless). Tienes 3 opciones:

### Opción 1: Railway (Recomendado - Más Fácil) ✅

Railway soporta SQLite nativamente y es perfecto para Node.js.

**Ventajas:**
- ✅ Soporta SQLite out-of-the-box
- ✅ Deploy con un click desde GitHub
- ✅ Variables de entorno fáciles
- ✅ $5/mes con uso generoso
- ✅ WebSockets incluidos

**Pasos:**

1. **Crea cuenta en Railway**
   - Ve a https://railway.app
   - Conecta tu GitHub

2. **Sube tu código a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/e3-generator.git
   git push -u origin main
   ```

3. **Deploy en Railway**
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Selecciona tu repositorio
   - Railway detectará automáticamente Node.js

4. **Configura Variables de Entorno**
   En Railway Dashboard → Variables:
   ```
   NODE_ENV=production
   JWT_SECRET=tu-secreto-super-seguro-aqui
   PORT=3000
   ```

5. **¡Listo!** Railway generará una URL pública

### Opción 2: Render ✅

Similar a Railway, también soporta SQLite.

**Pasos:**

1. **Crea cuenta en Render**
   - Ve a https://render.com
   - Conecta GitHub

2. **Nuevo Web Service**
   - Click "New +" → "Web Service"
   - Conecta tu repositorio
   - Configuración:
     ```
     Build Command: npm install
     Start Command: npm start
     ```

3. **Variables de Entorno**
   ```
   NODE_ENV=production
   JWT_SECRET=tu-secreto-super-seguro
   ```

4. **Deploy automático** en cada push a main

### Opción 3: Vercel (Requiere Cambios) ⚠️

Para usar Vercel necesitas migrar de SQLite a PostgreSQL.

**Pasos:**

1. **Instala Vercel Postgres**
   ```bash
   npm install @vercel/postgres
   ```

2. **Modifica** `server/models/database.js` para usar PostgreSQL

3. **Deploy:**
   ```bash
   npm install -g vercel
   vercel
   ```

4. **Conecta Postgres** desde Vercel Dashboard

## Opción Recomendada: Railway 🚀

Railway es la mejor opción porque:
- No requiere cambios en el código
- SQLite funciona perfectamente
- Deploy super rápido
- Gratis para proyectos pequeños

## Deployment Step-by-Step (Railway)

### 1. Preparar el código

```bash
# Asegúrate de que todo funciona local
npm run dev

# Crea .gitignore si no existe
cat > .gitignore << 'EOF'
node_modules/
.env
*.db
*.db-journal
dist/
.DS_Store
EOF
```

### 2. Subir a GitHub

```bash
git init
git add .
git commit -m "🚀 E³ Content Generator"

# Crea un repo nuevo en GitHub, luego:
git remote add origin https://github.com/TU-USUARIO/e3-generator.git
git branch -M main
git push -u origin main
```

### 3. Deploy en Railway

1. Ve a https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Selecciona `e3-generator`
4. Railway detecta Node.js automáticamente
5. Agrega variables de entorno:

```
NODE_ENV=production
JWT_SECRET=genera-uno-seguro-aqui
CORS_ORIGIN=https://tu-app.up.railway.app
```

### 4. Obtener URL

Railway te dará una URL como:
```
https://e3-generator-production.up.railway.app
```

### 5. Configurar Frontend

Actualiza `client/src/services/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://e3-generator-production.up.railway.app/api'
    : 'http://localhost:3000/api');
```

O crea `.env.production`:
```
VITE_API_URL=https://tu-app.up.railway.app/api
```

### 6. Re-deploy

```bash
git add .
git commit -m "Actualizar API URL"
git push
```

Railway hace auto-deploy automáticamente.

## Variables de Entorno Requeridas

Para producción, configura estas variables:

```env
# Requeridas
NODE_ENV=production
JWT_SECRET=un-secreto-muy-largo-y-aleatorio-aqui
PORT=3000

# Opcional pero recomendado
CORS_ORIGIN=https://tu-dominio.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Generar JWT_SECRET seguro:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Dominio Personalizado

### En Railway:

1. Ve a Settings → Domains
2. Click "Generate Domain" o "Custom Domain"
3. Si tienes dominio propio:
   - Agrega CNAME record en tu DNS:
     ```
     CNAME  app  your-app.up.railway.app
     ```

## Troubleshooting

### Error: Cannot find module 'better-sqlite3'

Solución:
```bash
npm install better-sqlite3 --save
git add package.json package-lock.json
git commit -m "Fix dependencies"
git push
```

### Error: CORS

Actualiza `.env` en Railway:
```
CORS_ORIGIN=https://tu-dominio-frontend.vercel.app
```

### Base de datos vacía después de deployment

SQLite se reinicia en cada deploy en Railway. Para persistencia:
1. Usa Railway Volumes (Beta)
2. O migra a PostgreSQL

**Configurar Volume en Railway:**
1. Settings → Volumes
2. Mount path: `/app/server/database`

## Monitoreo

Railway incluye:
- Logs en tiempo real
- Métricas de CPU/RAM
- Health checks automáticos

## Costos

**Railway:**
- $5/mes para Hobby plan
- $0.000463/GB-hr de RAM
- $0.000231/vCPU-hr

**Estimado:** ~$5-10/mes para uso moderado

## Alternativa: Deploy Separado

Si quieres frontend y backend separados:

**Frontend (Vercel):**
```bash
cd client
vercel
```

**Backend (Railway):**
- Deploy solo `/server`
- Configure `CORS_ORIGIN` con URL de Vercel

## Checklist Pre-Deploy

- [ ] `.gitignore` configurado
- [ ] Variables de entorno definidas
- [ ] Código en GitHub
- [ ] `npm install` funciona
- [ ] `npm start` funciona
- [ ] Tests pasan (si tienes)

## Soporte

Si tienes problemas:
1. Revisa logs en Railway Dashboard
2. Verifica variables de entorno
3. Asegúrate que el build funciona local

---

**Recomendación Final:** Usa Railway para empezar. Es el camino más rápido y funciona perfecto con esta aplicación. 🚀
