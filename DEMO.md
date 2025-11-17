# 🎯 Usuario Demo - E³ Content Generator

## Credenciales

Ya está creado un usuario demo listo para usar:

```
📧 Email:    demo@e3.com
🔑 Password: demo123
👤 Nombre:   Usuario Demo
```

## Acceso Rápido

1. **Inicia la aplicación**
   ```bash
   npm run dev
   ```

2. **Abre en navegador**
   ```
   http://localhost:5173
   ```

3. **Inicia sesión** con las credenciales arriba

## Resetear Usuario Demo

Si necesitas resetear el usuario demo (cambiar contraseña, recrearlo, etc.):

```bash
npm run demo:create
```

Este comando:
- ✅ Crea el usuario si no existe
- ✅ Actualiza la contraseña a `demo123` si ya existe
- ✅ Actualiza el nombre a "Usuario Demo"

## Crear Otros Usuarios de Prueba

Si quieres crear usuarios adicionales:

1. **Desde la interfaz:**
   - Click en "Regístrate"
   - Completa el formulario
   - Listo

2. **Desde código:**
   Modifica `scripts/create-demo-user.js` y ejecuta:
   ```bash
   node scripts/create-demo-user.js
   ```

## Base de Datos

Los usuarios se guardan en:
```
server/database/e3.db
```

### Ver usuarios en la base de datos

```bash
# Opción 1: SQLite CLI
sqlite3 server/database/e3.db "SELECT email, name FROM users;"

# Opción 2: DB Browser for SQLite (GUI)
# Descarga de: https://sqlitebrowser.org
```

## Usuarios Múltiples

Puedes tener múltiples usuarios. Cada uno tiene:
- Sus propios proyectos
- Sus propios ecosistemas
- Datos completamente separados

## Seguridad

⚠️ **Importante para producción:**

El usuario demo es solo para desarrollo. En producción:

1. **Elimina el usuario demo**
   ```bash
   sqlite3 server/database/e3.db "DELETE FROM users WHERE email='demo@e3.com';"
   ```

2. **Genera JWT_SECRET seguro**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Usa contraseñas fuertes**
   - Mínimo 12 caracteres
   - Letras, números y símbolos
   - No uses "demo123" en producción

## Proyectos Demo

El usuario demo puede crear proyectos de prueba. Ejemplos:

### Proyecto 1: SaaS de Marketing
```
Nombre: Marketing Analytics Platform
Descripción: Plataforma de analytics para agencias
Objetivo: Generación de Leads
Presupuesto: $15,000
```

### Proyecto 2: E-commerce
```
Nombre: Tienda Online Ropa Deportiva
Descripción: E-commerce B2C de ropa fitness
Objetivo: Ventas Directas
Presupuesto: $25,000
```

## Troubleshooting

### Error: Usuario ya existe
Si ves este error al crear cuenta con demo@e3.com:
```bash
npm run demo:create
```
Esto resetea la contraseña.

### Olvidé la contraseña
Ejecuta:
```bash
npm run demo:create
```
La contraseña será reseteada a `demo123`.

### Base de datos corrupta
Si la base de datos tiene problemas:
```bash
rm server/database/e3.db
npm run dev  # Se recrea automáticamente
npm run demo:create  # Recrea usuario demo
```

## Tips

1. **Usa el usuario demo para:**
   - ✅ Probar nuevas características
   - ✅ Demos a clientes
   - ✅ Testing rápido

2. **NO uses el usuario demo para:**
   - ❌ Datos de producción
   - ❌ Información sensible
   - ❌ Deployment en servidores públicos

---

**¿Necesitas ayuda?** Revisa [README.md](README.md) o [QUICKSTART.md](QUICKSTART.md)
