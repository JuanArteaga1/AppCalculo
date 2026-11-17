# vite-project/src/services/ — API, alertas y tutor con IA

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `api.js` | Toda llamada al backend; lanza `ErrorApi` |
| `temasService.js` | Curso y temas desde la API, sin respaldo local; visitas |
| `alertas.js` | Toda alerta Sileo: duración y Deshacer |
| `chatbotService.js` | Tutor con IA: solo `POST /api/tutor`, sin claves; dice cuándo ofrecer «Iniciar sesión» |
| `openaiService.js` | Resolución del laboratorio: valida la expresión y pregunta al tutor del backend |

## Rutas y relaciones
- Rutas relativas `/api/...`: Vite o el hosting las redirigen, así la cookie es del mismo sitio.
- Lo usan: `context/`, `hooks/`, `pages/`, `components/`.

## Estilo y convenciones
- Llamar con `api()`, nunca con `fetch` directo al backend.
- Alertas: skill `sileo-notificaciones`.

## No hacer
- Llamar a un proveedor de IA desde el navegador o guardar su clave con prefijo `VITE_`: queda en el bundle. Todo va por `/api/tutor`; la CSP solo permite `connect-src 'self'`.
- Pedir claves de servidor con prefijo `VITE_`.

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
