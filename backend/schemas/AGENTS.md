# vite-project/backend/schemas/ — modelos de Mongoose

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `modulos.js` | Módulos del curso: los tres de siempre, no se crean otros |
| `evaluaciones.js` | Quiz del docente: módulo, uno o varios `temas`, preguntas y estado |
| `temas.js` | Tema: `bloques` publicados y `borrador` |
| `versionesTema.js` | Copia por publicación; historial restaurable |
| `visitas.js` | Contador por tema y día; sin datos de quien visita |
| `usuarios.js` | Usuarios, roles, estados, frecuencia de uso, bloqueo y versión de sesión |
| `invitaciones.js` | Invitaciones de docentes con token hash, vencimiento y fecha del primer abrir |
| `restablecimientos.js` | Tokens de confirmación de correo y restablecimiento de contraseña |

## Rutas y relaciones
- Lo usan: `controllers/`, `models/`, `middlewares/sesion.js`, `scripts/`.

## Estilo y convenciones
- `videos` y `practicas` usan `default: undefined`: ausente significa sin migrar.

## No hacer
- Cambiar esos valores por defecto: la migración distingue vacío de ausente.

## Probar
- `node --check` del archivo y `npm start` desde `backend/`. Sin tests aún (EG-051).
