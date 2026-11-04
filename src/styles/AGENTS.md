# vite-project/src/styles/ — sistema visual compartido

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `panel.css` | Botones, tarjetas, panel, editor, 404, `boton-volver`, Sileo y cabecera animada |

## Rutas y relaciones
- Lo importa `App.jsx`, así que carga en toda la app.
- Los tokens viven en `index.css`; `panel.css` solo define alias.
- Estilos del laboratorio: `components/laboratorio/laboratorio.css`.

## Estilo y convenciones
- Sileo inyecta su CSS al final: sobrescribirlo pide `html body ...`.
- `a:hover` global vence a una clase sola: define el `:hover` en la clase.

## No hacer
- Escribir colores nuevos sin revisar antes los tokens.

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051). Revisar en 375 px y desktop.
