# E³ Content Generator

Plataforma profesional para crear ecosistemas de contenido estratégico basados en el modelo See-Think-Do-Care.

## Características

- ✅ **Backend Node.js/Express** con arquitectura modular
- ✅ **Base de datos SQLite** con mejor-sqlite3
- ✅ **Autenticación JWT** segura
- ✅ **API RESTful** completa
- ✅ **Frontend con Vite** y vanilla JavaScript
- ✅ **WebSockets** para actualizaciones en tiempo real
- ✅ **Exportación PDF/JSON** de ecosistemas
- ✅ **Sistema de routing** SPA
- ✅ **Gestión de estado** reactiva
- ✅ **Validación y sanitización** de datos
- ✅ **Rate limiting** y seguridad

## Estructura del Proyecto

```
e3/
├── server/                 # Backend Node.js
│   ├── routes/            # Rutas de la API
│   ├── controllers/       # Controladores
│   ├── models/           # Modelos de base de datos
│   ├── middleware/       # Middleware personalizado
│   ├── utils/            # Utilidades
│   ├── config/           # Configuración
│   └── index.js          # Punto de entrada del servidor
├── client/                # Frontend
│   ├── src/
│   │   ├── views/        # Vistas de la aplicación
│   │   ├── components/   # Componentes reutilizables
│   │   ├── services/     # Servicios (API client)
│   │   ├── utils/        # Utilidades (router, store)
│   │   ├── styles/       # Estilos CSS
│   │   └── main.js       # Punto de entrada
│   ├── public/           # Archivos estáticos
│   └── index.html        # HTML principal
├── .env                   # Variables de entorno
├── package.json          # Dependencias
└── vite.config.js        # Configuración de Vite
```

## Instalación

### Prerequisitos

- Node.js 18+
- npm o yarn

### Pasos

1. **Clonar el repositorio** (o navegar al directorio)

```bash
cd /Volumes/CHUMBI\ T7/imaquinua/e3
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

El archivo `.env` ya está configurado. Para producción, actualiza:

```env
NODE_ENV=production
JWT_SECRET=tu-secreto-muy-seguro
CORS_ORIGIN=https://tu-dominio.com
```

4. **Iniciar en modo desarrollo**

```bash
npm run dev
```

Esto iniciará:
- Backend en `http://localhost:3000`
- Frontend en `http://localhost:5173`

5. **Acceder a la aplicación**

Abre tu navegador en: `http://localhost:5173`

**Credenciales Demo:**
- Email: `demo@e3.com`
- Password: `demo123`

(Usuario demo ya creado automáticamente)

## Scripts Disponibles

```bash
npm run dev          # Inicia servidor y cliente en modo desarrollo
npm run server:dev   # Solo servidor con nodemon
npm run client:dev   # Solo cliente con Vite
npm run demo:create  # Crea/resetea usuario demo (demo@e3.com / demo123)
npm run build        # Construye para producción
npm start           # Inicia en modo producción
```

## API Endpoints

### Autenticación

```
POST   /api/auth/register    # Registrar usuario
POST   /api/auth/login        # Iniciar sesión
GET    /api/auth/me           # Obtener usuario actual
```

### Proyectos

```
GET    /api/projects          # Listar proyectos del usuario
GET    /api/projects/:id      # Obtener proyecto específico
POST   /api/projects          # Crear proyecto
PUT    /api/projects/:id      # Actualizar proyecto
DELETE /api/projects/:id      # Eliminar proyecto
```

### Ecosistemas

```
GET    /api/ecosystems/project/:projectId    # Listar ecosistemas de un proyecto
GET    /api/ecosystems/:id                   # Obtener ecosistema específico
POST   /api/ecosystems                       # Crear/generar ecosistema
DELETE /api/ecosystems/:id                   # Eliminar ecosistema
```

### Analytics

```
POST   /api/analytics/track       # Registrar evento
GET    /api/analytics/user        # Estadísticas del usuario
```

### Exportación

```
GET    /api/export/json/:ecosystemId    # Exportar como JSON
GET    /api/export/pdf/:ecosystemId     # Exportar como PDF
```

## Modelo de Datos

### User
```javascript
{
  id: String,
  email: String,
  password: String (hashed),
  name: String,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Project
```javascript
{
  id: String,
  user_id: String,
  name: String,
  description: String,
  status: String, // 'draft', 'active', 'archived'
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Ecosystem
```javascript
{
  id: String,
  project_id: String,
  objective: String,
  budget: Number,
  product: String,
  market: String,
  audience: String,
  value_proposition: String,
  pains: String, // newline separated
  gains: String, // newline separated
  distribution: JSON,
  total_pieces: Number,
  projected_roas: Number,
  timeframe: String,
  created_at: Timestamp,
  updated_at: Timestamp
}
```

### Content Piece
```javascript
{
  id: String,
  ecosystem_id: String,
  stage: String, // 'see', 'think', 'do', 'care'
  type: String,
  title: String,
  description: String,
  kpi: String,
  budget: Number,
  channel: String,
  format: String,
  score: Number,
  pain: String,
  gain: String,
  created_at: Timestamp
}
```

## Flujo de Trabajo

1. **Registrarse/Iniciar Sesión**
   - Crear cuenta o iniciar sesión
   - El token JWT se guarda en localStorage

2. **Crear Proyecto**
   - Desde el dashboard, crear un nuevo proyecto
   - Definir nombre y descripción

3. **Generar Ecosistema**
   - Abrir proyecto
   - Completar formulario con:
     - Objetivo de marketing
     - Presupuesto
     - Información del producto
     - Audiencia
     - Propuesta de valor
     - Pains y Gains del cliente

4. **Ver Resultados**
   - Visualizar ecosistema generado
   - Ver distribución de presupuesto
   - Revisar piezas de contenido por etapa

5. **Exportar**
   - Descargar como JSON para integración
   - Descargar como PDF para presentación

## Seguridad

- ✅ Passwords hasheados con bcrypt
- ✅ Autenticación JWT
- ✅ Rate limiting en endpoints
- ✅ Validación de inputs con express-validator
- ✅ Sanitización de datos
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ SQL injection prevention con prepared statements

## Tecnologías Utilizadas

### Backend
- Express.js - Framework web
- better-sqlite3 - Base de datos
- bcryptjs - Hashing de passwords
- jsonwebtoken - Autenticación
- socket.io - WebSockets
- pdfkit - Generación de PDFs
- helmet - Seguridad HTTP
- express-validator - Validación

### Frontend
- Vite - Build tool
- Vanilla JavaScript - Sin frameworks
- CSS Modules - Estilos
- Fetch API - HTTP requests

## Modelo E³ (See-Think-Do-Care)

### SEE - Descubrimiento
- **Objetivo**: Alcance y awareness
- **Contenido**: Videos emocionales, problem agitation, educación de categoría
- **Canales**: Meta Ads, Google Display, TikTok, YouTube

### THINK - Investigación
- **Objetivo**: Consideración y engagement
- **Contenido**: Social proof, demos, comparativas, autoridad
- **Canales**: Google Search, Meta Retargeting, LinkedIn, Email

### DO - Conversión
- **Objetivo**: Ventas y conversión
- **Contenido**: Ofertas limitadas, garantías, bundles, recovery
- **Canales**: Google Shopping, Meta DPA, Email Automation

### CARE - Retención
- **Objetivo**: Loyalty y advocacy
- **Contenido**: Onboarding, success content, VIP, referidos
- **Canales**: Email, In-App, Community, WhatsApp

## Distribuciones de Presupuesto por Objetivo

| Objetivo | SEE | THINK | DO | CARE |
|----------|-----|-------|-------|------|
| Lanzamiento | 35% | 30% | 25% | 10% |
| Awareness | 45% | 30% | 15% | 10% |
| Leads | 20% | 40% | 30% | 10% |
| Ventas | 15% | 25% | 45% | 15% |
| Retención | 10% | 15% | 25% | 50% |
| Advocacy | 5% | 15% | 20% | 60% |

## Desarrollo

### Agregar Nueva Vista

1. Crear archivo en `client/src/views/`
2. Implementar clase con métodos `render()` y `mounted()`
3. Registrar ruta en `client/src/main.js`

```javascript
export class MiVista {
  async render() {
    return `<div>HTML</div>`;
  }

  async mounted() {
    // Lógica después del render
  }
}
```

### Agregar Nuevo Endpoint

1. Crear ruta en `server/routes/`
2. Importar en `server/index.js`
3. Registrar con `app.use()`

```javascript
import express from 'express';
const router = express.Router();

router.get('/', async (req, res) => {
  res.json({ data: [] });
});

export default router;
```

## Producción

1. **Construir frontend**
```bash
npm run build
```

2. **Configurar variables de entorno**
```bash
NODE_ENV=production
PORT=3000
```

3. **Iniciar servidor**
```bash
npm start
```

4. **Opcional: PM2 para gestión de procesos**
```bash
npm install -g pm2
pm2 start server/index.js --name e3-generator
pm2 save
pm2 startup
```

## Troubleshooting

### Puerto en uso
```bash
# Cambiar puerto en .env
PORT=3001
```

### Error de base de datos
```bash
# Eliminar y reinicializar
rm server/database/e3.db
npm run server:dev
```

### Error de permisos SQLite
```bash
chmod 755 server/database
```

## Licencia

MIT

## Autor

Creado con Claude Code

---

**Nota**: Esta es una aplicación profesional completa lista para desarrollo y producción. Para cualquier duda, revisa el código fuente o consulta la documentación de las tecnologías utilizadas.
