# vite-project/src/components/tema/ — render de un tema

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `ContenidoTema.jsx` | Pasa bloques a pantalla: texto, tablas, gráficas y ejercicios |
| `AnimacionLimite.jsx` | Demostración SVG fija de los temas 1.1 y 1.2 |
| `EjercicioBloque.jsx` | Opción múltiple corregida en el navegador; no guarda |
| `PracticaLaboratorio.jsx` | Lleva al laboratorio con el ejercicio cargado |
| `estilosContenido.js` | Estilos compartidos con el editor |

## Rutas y relaciones
- Importa de: `components/` (gráficas), `data/glosario.js`, `lib/bloques.js`.
- Lo usan: `pages/TemaPage.jsx` y la vista previa de `admin/EditorTema.jsx`.

## Estilo y convenciones
- Texto: Markdown simple con `$...$`, `$$...$$` y marcas `{centro}` o `{derecha}`.
- El glosario se aplica a todo el tema, con tope por tema.

## No hacer
- Quitar `escaparTexto`: el texto del administrador termina en `dangerouslySetInnerHTML`.
- Llevar `AnimacionLimite.jsx` al editor o a la base: es fija; más animaciones piden otra spec.

## Probar
- Abrir el tema con los desplegables abiertos: sin `.katex-error`, `$` sueltos ni `[[`.
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
