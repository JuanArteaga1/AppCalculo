# vite-project/src/ — frontend React

## Contiene
| Archivo o carpeta | Qué hace |
| --- | --- |
| `main.jsx` | Monta `App` con `index.css` |
| `App.jsx` | Rutas, marco (navbar y pie) y `<Toaster>` |
| `index.css` | Tokens de color y tipografía, estilos globales |
| `pages/` | Una pantalla por ruta |
| `components/` | Piezas compartidas y gráficas |
| `context/` | Sesión del usuario |
| `hooks/` | Datos del curso |
| `services/` | API, alertas y OpenAI |
| `data/` | Respaldo de temas, glosario, videos y maquetas |
| `lib/` | Lógica pura, también usada desde Node |
| `styles/` | `panel.css`, sistema visual compartido |
| `assets/` | Restos de la plantilla de Vite |

## Rutas y relaciones
- Toda ruta nueva se declara en `App.jsx`; lo desconocido cae en `pages/NoEncontrado.jsx`.
- El panel de administrador y el laboratorio traen su propio marco.

## Estilo y convenciones
- JavaScript sin TypeScript. Texto visible en español, tuteando.
- Componentes en PascalCase; utilidades y hooks en camelCase.
- Convenciones completas: skill `desarrollo`.

## No hacer
- Agregar Tailwind, TypeScript o librerías de estado sin decisión registrada.
- Llamar a `setState` dentro de `useEffect`: lo prohíbe React Compiler.

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
