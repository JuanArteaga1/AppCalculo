# vite-project/backend/tests/ — un test por criterio de las specs

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `apoyo.js` | Arranca un backend por archivo, crea cuentas temporales `test.login.` y las borra |
| `contrasenas.test.js` | Reglas de contraseña (spec-login CA-09) |
| `login.test.js` | Ingreso, cuenta inactiva, mensaje genérico, versión y duración de sesión, frecuencia de uso |
| `correo.test.js` | Envío de enlaces y respaldo sin SMTP (spec-login BR-04 y CA-02), sin red |
| `evaluaciones-modulo-tema.test.js` | Módulo y temas del quiz, validación 400 y 403 (spec de quices CA-01 a CA-11); puerto 5196, sin crear módulos ni temas |
| `login-bloqueo.test.js` | Bloqueo tras 5 intentos fallidos y su mensaje propio (spec-login CA-10) |
| `registro-estudiante.test.js` | Registro del estudiante, confirmación y reenvío (spec-login CA-15, CA-16, CA-18, BR-11, BR-12); puerto 5195, sin SMTP |
| `invitaciones.test.js` | Invitaciones y registro de docentes (spec-login CA-02, CA-03, CA-07 a CA-09) |

## Rutas y relaciones
- Usan la base del `.env` del backend: las cuentas temporales se borran al terminar.
- Cada archivo usa su propio puerto (5195 a 5199, sin repetir): el límite de 10 ingresos por IP es por proceso.
- `npm test` corre un archivo a la vez (`--test-concurrency=1`): cada archivo borra al terminar todas las cuentas `test.login.`, y en paralelo borraba las de los demás.

## Estilo y convenciones
- `node --test` de Node, sin dependencias. Nombre de cada test: el criterio que cubre (`CA-01: ...`).
- Un archivo nuevo con ingresos: puerto nuevo y menos de 10 ingresos.

## No hacer
- Usar las cuentas de prueba del equipo ni correos reales.

## Probar
- `npm test` desde `backend/`.
