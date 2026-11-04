# vite-project/src/components/laboratorio/ — laboratorio y utilidades matemáticas

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `mathUtils.js` | Normaliza, analiza, compila y pasa a LaTeX con mathjs |
| `herramientas.js` | Resultado de límite o derivada y sus marcadores |
| `asintotas.js` | Cálculo numérico de asíntotas |
| `useDatosLimite.js` | Filas y estado de la tabla de aproximación |
| `useCursorTeclado.js` | Conecta el teclado con un input sin perder el cursor |
| `MathKeyboard.jsx` | Teclado flotante, con pestañas extra opcionales |
| `EntradaFuncion.jsx` | Campo de función con vista previa |
| `ListaFunciones.jsx` | Funciones graficadas |
| `PanelHerramientas.jsx` | Análisis de la función seleccionada |
| `PlotCanvas.jsx` | Plano cartesiano interactivo |
| `Tex.jsx` | Muestra LaTeX con KaTeX |
| `laboratorio.css` | Estilos con prefijo `lab-` |

## Rutas y relaciones
- Lo usan: `pages/Laboratorio.jsx`, `components/`, `admin/` y `tema/`.
- El cálculo vive en los `.js`; los `.jsx` solo muestran.

## Estilo y convenciones
- Convención del curso: `ln` natural, `log` base 10; `sen` y `tg` en español.
- Clases siempre con prefijo `lab-`: el CSS se carga también en el editor.

## No hacer
- Probar el teclado solo con `.click()` por código: la cabecera captura el puntero.

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
