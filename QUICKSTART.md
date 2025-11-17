# Quick Start Guide - E³ Content Generator

## Instalación en 3 Pasos

### 1. Instalar Dependencias
```bash
cd "/Volumes/CHUMBI T7/imaquinua/e3"
npm install
```

### 2. Iniciar Aplicación
```bash
npm run dev
```

Esto iniciará:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

### 3. Usar la Aplicación

1. Abre tu navegador en: **http://localhost:5173**
2. Usa las credenciales demo (ver abajo)
3. Crea un proyecto
4. Genera tu primer ecosistema E³

## 🎯 Credenciales Demo

Usuario demo ya creado y listo para usar:

```
📧 Email:    demo@e3.com
🔑 Password: demo123
```

### Recrear Usuario Demo

Si necesitas resetear el usuario demo:

```bash
npm run demo:create
```

Esto creará (o actualizará) el usuario demo con la contraseña `demo123`.

## Estructura de Carpetas

```
e3/
├── server/          → Backend Node.js/Express
│   ├── routes/      → Endpoints de la API
│   ├── models/      → Base de datos SQLite
│   └── utils/       → Lógica de generación E³
├── client/          → Frontend Vite
│   └── src/
│       ├── views/   → Vistas de la app
│       ├── utils/   → Router y Store
│       └── styles/  → CSS modular
└── .env             → Configuración
```

## Comandos Útiles

```bash
# Desarrollo (servidor + cliente)
npm run dev

# Solo servidor
npm run server:dev

# Solo cliente
npm run client:dev

# Producción
npm run build
npm start
```

## Troubleshooting

**Error: Puerto en uso**
```bash
# Edita .env y cambia:
PORT=3001
```

**Error: Base de datos**
```bash
rm server/database/e3.db
npm run dev
```

**Error: Dependencias**
```bash
rm -rf node_modules package-lock.json
npm install
```

## Siguiente Paso

Lee el [README.md](README.md) completo para documentación detallada de la API, arquitectura y desarrollo.

## Soporte

- Revisa el código en `server/` y `client/src/`
- Consulta la documentación de la API en README.md
- Todas las rutas están documentadas en los archivos

---

¡Listo para generar ecosistemas de contenido! 🚀
