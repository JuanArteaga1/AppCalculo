# vite-project/src/pages/ — una pantalla por ruta

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `Home.jsx` | Portada |
| `ConceptosPrevios.jsx` | Listado público de conceptos previos |
| `ConceptoPrevioPage.jsx` | Detalle público de un concepto previo |
| `Calculo1.jsx` | Curso y temas de una unidad |
| `TemaPage.jsx` | Tema publicado; registra la visita; cabecera animada en 1.1 y 1.2 |
| `BibliotecaMultimedia.jsx` | Videoteca |
| `Laboratorio.jsx` | Laboratorio de graficación, con su propio marco |
| `SeguirAprendiendo.jsx` | Evalúate público; maqueta sin guardar |
| `Acceso.jsx` | Ingreso con correo y contraseña; registro del estudiante y recuperar acceso por correo |
| `Confirmar.jsx` | Confirma el correo del estudiante desde el enlace (`#token`) y permite pedir otro |
| `Recuperar.jsx` | Cambiar la contraseña desde el enlace del correo (`#token`): 10 minutos desde el clic, contador y pedir otro enlace |
| `Registro.jsx` | Registro del docente desde la invitación (`#token`): correo fijo, contador de 10 minutos, avisos con Sileo |
| `QuizCompartido.jsx` | `/quiz/:id`: el estudiante responde el quiz, con lo marcado guardado en el navegador, y ve su nota y las correctas al vencer |
| `Espacio.jsx` | Marco de estudiante y maestro |
| `Admin.jsx` | Panel completo: secciones, módulos, Evalúate, Recursos y listado real de docentes |
| `NoEncontrado.jsx` | 404 reutilizable con destino configurable |

## Rutas y relaciones
- Cada página se declara en `App.jsx`.
- Las piezas de una zona van en `components/<zona>/`.

## Estilo y convenciones
- Un recurso inexistente muestra `NoEncontrado`, no redirige en silencio.
- Pantallas de espacios, acceso y panel: clases de `styles/panel.css`.

## No hacer
- Renombrar `SaberesPrevios.jsx`, `SeguirAprendiendo.jsx` o `BibliotecaMultimedia.jsx` sin tarea.

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
