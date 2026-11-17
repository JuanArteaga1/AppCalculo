# vite-project/src/components/auth/ — formularios de autenticación

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `FormularioLogin.jsx` | Formulario de inicio de sesión con correo y contraseña (sin Google) |
| `FormularioRegistro.jsx` | Formulario de registro del estudiante con carrera |
| `FormularioRecuperar.jsx` | Formulario de recuperar acceso por correo |
| `LoginWallQuiz.jsx` | Pantalla de dos columnas para el login wall de `/quiz/:id` |

## Rutas y relaciones
- Importa de: `services/api.js`, `services/alertas.js`, `context/sesion.js`.
- Lo usan: `pages/Acceso.jsx`, `pages/QuizCompartido.jsx`.

## Estilo y convenciones
- Reciben callbacks (`alEntrar`, `alCambiarModo`) y props de configuración en lugar de depender de la ruta.
- Usan clases de `styles/panel.css` y del componente padre.
- No llaman a `useSearchParams` ni a `Navigate`: eso queda en las páginas.

## No hacer
- Agregar lógica de ruta o redirección aquí.
- Depender de `window.location` para la URL de retorno.

## Probar
- `npx eslint src/components/auth --max-warnings 0` y `npm run build`, desde `vite-project/`.
