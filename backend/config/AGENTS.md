# vite-project/backend/config/ — conexión a MongoDB

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `dbClient.js` | Conecta y cierra con Mongoose; base `PlataformaEducativa` |
| `uriMongo.js` | Arma la URI: `MONGO_URI` o las variables de Atlas; lo usan los scripts |

## Rutas y relaciones
- Lo usa: `app.js`.
- Credenciales por `USER_DB`, `PASS_DB` y `SERVER_DB`; `MONGO_URI` completa tiene prioridad (mongod local).

## No hacer
- Dejar credenciales en el código o en los logs.

## Probar
- `node --check` del archivo y `npm start` desde `backend/`. Sin tests aún (EG-051).
