# vite-project/backend/lib/ — contrato de errores y validación

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `respuestas.js` | `errorCliente` (`{ error, descripcion }`) y `errorSistema` (sin cuerpo) |
| `validarBloques.js` | Lista blanca de bloques, videos, prácticas y encabezado |

## Rutas y relaciones
- Lo usan: `controllers/`, `middlewares/`, `routes/`, `app.js`, `scripts/migrarTemas.js`.
- Un bloque nuevo se agrega primero en `validarBloques.js`.

## Estilo y convenciones
- Se reconstruye campo por campo: lo desconocido nunca llega a la base.

## No hacer
- Enviar en un 5xx detalle del error: queda solo en el log.

## Probar
- `node --check` del archivo y `npm start` desde `backend/`. Sin tests aún (EG-051).
