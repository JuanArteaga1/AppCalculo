# vite-project/src/hooks/ — datos del curso

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `useCurso.js` | `useCurso` y `useTema`, con copia local de arranque |

## Rutas y relaciones
- Importa de: `services/temasService.js`.
- Lo usan: `pages/Calculo1.jsx`, `pages/TemaPage.jsx`.
- Los hooks de una sola zona van junto a ella, como `laboratorio/useDatosLimite.js`.

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
