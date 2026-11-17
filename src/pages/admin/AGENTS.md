# vite-project/src/pages/admin/ — pantallas del panel de administrador

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `AdminConceptosPrevios.jsx` | Listado de conceptos previos para el administrador |
| `AdminConceptoPrevio.jsx` | Editor de un concepto previo |

## Rutas y relaciones
- Importan de: `services/api.js`, `services/alertas.js`, `components/admin/`, `components/tema/`.
- `pages/Admin.jsx` las monta dentro de la pestaña **Conceptos previos** de Recursos, no como sección propia del menú lateral.
- Aceptan callbacks (`onCrear`, `onEditar`, `onGuardar`, `onCancelar`) para funcionar embebidas; si no reciben callbacks, usan rutas.

## Estilo y convenciones
- Usan clases de `styles/panel.css`.
- Reutilizan componentes del editor de temas (`ListaBloques`) y del render de temas (`ContenidoTema`).

## No hacer
- Agregar lógica de ruta fuera de estas páginas.

## Probar
- `npx eslint src/pages/admin --max-warnings 0` y `npm run build`, desde `vite-project/`.
