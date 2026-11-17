# vite-project/public/ — archivos servidos en la raíz del sitio

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `LogoUniversidad.png` | Logo; navbar, pie, panel y acceso |
| `Quimerito.png`, `gift2.gif` | Mascota e imagen de `Home.jsx` |
| `Estudiantes(1).jpeg` | Imagen de respaldo de los videos |
| `Estudiantes(2).jpg`, `Estudiantes(3).jpg`, `Estudiantes(4).jpg` | Sin referencias en `src/` |
| `GrupoDesarrollo.JPG`, `imagen_uniautonoma.jpg`, `images.jpg` | Sin referencias en `src/` |
| `logo matematicas.png` | Sin referencias en `src/` |
| `logos autonoma_2.png` | Original del logo de los correos; la versión reducida está en `backend/assets/correo/` |
| `physics.png`, `profile.png` | Sin referencias en `src/` |

## Rutas y relaciones
- Se referencian con ruta absoluta, por ejemplo `/LogoUniversidad.png`.
- Lo nuevo va aquí si se enlaza por URL; si lo importa un componente, en `src/assets/`.

## No hacer
- Borrar lo que no tiene referencias en `src/` sin preguntar: puede usarse fuera del código.
