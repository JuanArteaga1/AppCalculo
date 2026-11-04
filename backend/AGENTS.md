# vite-project/backend/ — API Express con MongoDB

## Contiene
| Archivo o carpeta | Qué hace |
| --- | --- |
| `app.js` | Arranque, middlewares, rutas bajo `/api`, 404 y errores |
| `routes/` | Rutas y permisos |
| `controllers/` | Lógica de cada recurso |
| `middlewares/` | Sesión, roles y registro de peticiones |
| `schemas/` | Modelos de Mongoose |
| `models/` | Acceso a usuarios |
| `lib/` | Contrato de errores y validación |
| `config/` | Conexión a MongoDB |
| `scripts/` | Migración, primer administrador y cuentas de prueba |
| `package.json`, `package-lock.json` | Dependencias propias |
| `.env.example` | Variables necesarias, sin valores |
| `.env` | Secretos locales; ignorado por git |
| `usuarios-prueba.json` | Credenciales de las cuentas de prueba; ignorado por git, no se imprime |
| `uploads/`, `node_modules/` | Imágenes subidas y dependencias; ignorados por git |

## Rutas y relaciones
- Se ejecuta desde esta carpeta: lee `.env` de aquí.
- Puerto por `PORT`; el frontend espera `5100` si no hay `BACKEND_URL`.

## Estilo y convenciones
- Errores con `lib/respuestas.js`: skill `seguridad`.
- Sin datos en los logs: solo método, ruta, código y colección.

## No hacer
- Abrir o imprimir `.env`.
- Usar `npm audit fix --omit=dev` en `vite-project/`: borra Vite y ESLint.

## Probar
- `node --check` del archivo y `npm start` desde `backend/`. Sin tests aún (EG-051).
