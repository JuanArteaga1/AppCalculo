# vite-project/src/data/ — respaldo de temas, glosario, videos y maquetas

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `temas.js` | Copia local del curso: respaldo y migración inicial |
| `glosario.js` | Términos y enlaces automáticos en los temas |
| `videos.js` | Videoteca y utilidades de enlaces de YouTube |
| `mockAdmin.js` | Docentes, creaciones y recursos de ejemplo (EG-061) |
| `mockEspacio.js` | Datos de ejemplo de los espacios |
| `mockEstudiantes.js` | Fichas del grupo para el maestro |
| `mockTareas.js` | Talleres y quices de la página Evalúate |

## Rutas y relaciones
- Importa de: `lib/bloques.js`.
- Lo usan: `pages/`, `components/`, `services/temasService.js`, `backend/scripts/migrarTemas.js`.

## Estilo y convenciones
- En `temas.js` cada barra de LaTeX va doble.

## No hacer
- Editar `temas.js` para cambiar un tema: lo publicado vive en MongoDB.
- Importar con ruta sin extensión lo que use Node: `migrarTemas.js` no pasa por Vite.

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
