# vite-project/backend/routes/ — rutas y permisos

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `usuarios.js` | `/api/usuarios`: login con límite, logout, me y CRUD de administrador |
| `temas.js` | `/api/temas`: curso y tema publicado, públicos |
| `admin.js` | `/api/admin`: visitas, imágenes y edición de temas |

## Rutas y relaciones
- Importa de: `controllers/`, `middlewares/`, `lib/`.
- Lo monta: `app.js`.
- Un recurso nuevo se monta bajo `/api` antes del 404 de `app.js`.

## Estilo y convenciones
- Todo `admin.js` pasa por `requiereRol("administrador")`.
- Rutas sin lógica: la lógica va en `controllers/`.

## No hacer
- Agregar una ruta de escritura sin sesión y rol.

## Probar
- `node --check` del archivo y `npm start` desde `backend/`. Sin tests aún (EG-051). Comprobar el permiso en la API, no solo en pantalla.
