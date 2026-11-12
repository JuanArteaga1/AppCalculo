# vite-project/backend/controllers/ — lógica de cada recurso

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `temaController.js` | Curso, borrador, publicación, versiones y restauración |
| `evaluacionController.js` | Quices: crear, editar y publicar con temas del módulo (400), 403 si es de otro docente; notas y respuestas |
| `usuarioController.js` | Login, Google OAuth con `state` y roles por correo, atajo de sesión de prueba, sesión, registro del estudiante con confirmación de correo, invitación de docentes y CRUD de usuarios |
| `visitaController.js` | Registro y resumen de visitas |

## Rutas y relaciones
- Importa de: `schemas/`, `models/`, `lib/`, `middlewares/sesion.js`.
- Lo usan: `routes/` y `app.js` (`POST /api/visitas`).

## Estilo y convenciones
- Clases exportadas como instancia.
- 4xx con `errorCliente`, 5xx con `errorSistema`.

## No hacer
- Responder con el error crudo.
- Guardar `req.body` directo: pasa antes por `lib/validarBloques.js`.
- Dar `PUT /usuarios/:id` por funcional: hoy no guarda.

## Probar
- `node --check` del archivo y `npm start` desde `backend/`. Sin tests aún (EG-051).
