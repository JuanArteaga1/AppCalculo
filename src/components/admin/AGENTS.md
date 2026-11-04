# vite-project/src/components/admin/ — editor de temas y gráficas del panel

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `EditorTema.jsx` | Autoguardado, publicación, descarte e historial |
| `ListaBloques.jsx` | Lista editable; también dentro de los desplegables |
| `FormularioBloque.jsx` | Formulario de cada tipo de bloque |
| `AreaTexto.jsx` | Área de texto con botones de formato, fórmula y enlace |
| `RecursosTema.jsx` | Editores de videos y ejercicios de práctica |
| `bloquesEditor.js` | Catálogo, creación, resumen y validación de bloques |
| `herramientasTexto.js` | Fórmula a LaTeX, enlaces, títulos y alineación |
| `GraficasAdmin.jsx` | Barras y línea semanal del panel |
| `formato.js` | Números con separador de miles |

## Rutas y relaciones
- Importa de: `laboratorio/` (teclado y cálculo), `tema/` (vista previa), `lib/bloques.js`.
- Lo usa: `pages/Admin.jsx`.
- Un bloque nuevo también toca `backend/lib/validarBloques.js` y `tema/ContenidoTema.jsx`.

## Estilo y convenciones
- Autoguardado como borrador; el estudiante ve lo publicado.
- Resultados y avisos con `services/alertas.js`; errores de un campo, junto al campo.

## No hacer
- Dar formato con títulos o alineación en enunciados: esos textos no se procesan por líneas.
- Validar solo aquí: el backend reconstruye y valida cada bloque.

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
