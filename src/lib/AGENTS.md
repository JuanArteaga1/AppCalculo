# vite-project/src/lib/ — lógica pura, también usada desde Node

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `bloques.js` | Formato antiguo a bloques y `MARCA_ALINEACION` |

## Rutas y relaciones
- Lo usan: `data/`, `services/`, `components/admin/`, `components/tema/`, `backend/scripts/migrarTemas.js`.
- Lo nuevo va aquí si no depende de React ni del navegador.

## No hacer
- Importar React o rutas sin extensión: lo ejecuta Node sin Vite.

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
