# vite-project/backend/lib/ — contrato de errores y validación

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `respuestas.js` | `errorCliente` (`{ error, descripcion }`) y `errorSistema` (sin cuerpo) |
| `validarBloques.js` | Lista blanca de bloques, videos, prácticas y encabezado |
| `contrasenas.js` | Reglas de contraseña: mínimo 10 caracteres y sin las más comunes |
| `carreras.js` | Lista cerrada de pregrados y especializaciones (spec-login BR-11) |
| `correo.js` | Envío por SMTP de invitación, confirmación y restablecimiento, con enlace de respaldo |

## Rutas y relaciones
- Lo usan: `controllers/`, `middlewares/`, `routes/`, `app.js`, `scripts/migrarTemas.js`.
- Un bloque nuevo se agrega primero en `validarBloques.js`.

## Estilo y convenciones
- Se reconstruye campo por campo: lo desconocido nunca llega a la base.

## No hacer
- Mostrar el enlace de respaldo de `correo.js` a quien no sea administrador: con él, cualquiera confirmaría o restablecería una cuenta ajena.
- Poner el destinatario o el enlace en los logs.
- Enviar en un 5xx detalle del error: queda solo en el log.

## Probar
- `npm test` y `node --check` del archivo, desde `backend/`. Cuenta SMTP real: `npm run probar-correo -- tu.correo@uniautonoma.edu.co`.
