# vite-project/src/components/espacio/ — paneles de estudiante y maestro

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `PanelesEstudiante.jsx` | Progreso y Evalúate, de estudiante y de maestro |
| `PanelEstudiantes.jsx` | Lista del grupo y perfil de cada estudiante |
| `PanelesComunes.jsx` | Laboratorio, videos, tutor y ajustes |

## Rutas y relaciones
- Importa de: `data/mock*.js`.
- Lo usa: `pages/Espacio.jsx`.

## Estilo y convenciones
- Maquetas estáticas: aún sin backend.
- Clases de `styles/panel.css`.

## No hacer
- Cambiar la forma de los `mock*.js`: estas pantallas leen sus claves directamente.

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
