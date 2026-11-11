# vite-project/src/components/espacio/ — paneles de estudiante y maestro

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `PanelesEstudiante.jsx` | Progreso y Evalúate, de estudiante y de maestro; el formulario de quiz elige módulo y varios temas del backend |
| `PanelEstudiantes.jsx` | Lista del grupo y perfil de cada estudiante |
| `PanelesComunes.jsx` | Laboratorio, videos, tutor y ajustes |

## Rutas y relaciones
- Importa de: `data/mock*.js`, `services/api.js` y `services/alertas.js`.
- Lo usa: `pages/Espacio.jsx`.

## Estilo y convenciones
- Evalúate del maestro ya usa el backend (`/api/evaluaciones`, `/api/temas`); lo demás sigue con maquetas.
- Clases de `styles/panel.css`.

## No hacer
- Cambiar la forma de los `mock*.js`: estas pantallas leen sus claves directamente.

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
