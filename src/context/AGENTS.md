# vite-project/src/context/ — sesión del usuario

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `SesionProvider.jsx` | Consulta `/usuarios/me` y expone usuario y salir |
| `sesion.js` | Contexto, `useSesion`, rutas por rol, `destinoAlIngresar` y `MODO_DEMO` |

## Rutas y relaciones
- Importa de: `services/api.js`.
- Lo usan: `App.jsx`, `Navbar.jsx`, `RutaProtegida.jsx`, `pages/`.

## Estilo y convenciones
- La sesión vive en una cookie httpOnly: el JavaScript no la lee.
- Separado en dos archivos porque un archivo de componente solo exporta componentes.

## No hacer
- Tratar esto como permiso: solo decide qué mostrar; quien autoriza es el backend.

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
