# vite-project/backend/middlewares/ — sesión, roles y registro

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `sesion.js` | JWT en cookie httpOnly con versión de sesión, `requiereSesion`, `requiereRol` e `invalidarSesiones` |
| `registro.js` | Logs de peticiones y MongoDB; `LOG_PETICIONES=false` los apaga |

## Rutas y relaciones
- Importa de: `schemas/usuarios.js`, `lib/respuestas.js`.
- Lo usan: `app.js`, `routes/`, `controllers/usuarioController.js`.

## Estilo y convenciones
- `requiereSesion` consulta la base en cada petición: un usuario borrado pierde acceso.
- `comprobarSecreto` falla al arrancar si falta `JWT_SECRET`.
- Cambiar o restablecer la contraseña llama a `invalidarSesiones`: cierra las sesiones de otros equipos.

## No hacer
- Registrar cuerpos, cookies o tokens.

## Probar
- `node --check` del archivo y `npm start` desde `backend/`. Sin tests aún (EG-051).
