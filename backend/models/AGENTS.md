# vite-project/backend/models/ — acceso a usuarios

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `usuarios.js` | Crear, consultar, actualizar y borrar usuarios |

## Rutas y relaciones
- Importa de: `schemas/usuarios.js`.
- Lo usa: `controllers/usuarioController.js`.
- Los temas y visitas usan `schemas/` directo desde su controlador.

## No hacer
- Devolver la contraseña en una respuesta.

## Probar
- `node --check` del archivo y `npm start` desde `backend/`. Sin tests aún (EG-051).
