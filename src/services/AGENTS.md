# vite-project/src/services/ — API, alertas y OpenAI

## Contiene
| Archivo | Qué hace |
| --- | --- |
| `api.js` | Toda llamada al backend; lanza `ErrorApi` |
| `temasService.js` | Curso desde la API con respaldo local y visitas |
| `alertas.js` | Toda alerta Sileo: duración y Deshacer |
| `chatbotService.js` | Tutor con OpenAI desde el navegador |
| `openaiService.js` | Resolución con IA desde el navegador |

## Rutas y relaciones
- Rutas relativas `/api/...`: Vite o el hosting las redirigen, así la cookie es del mismo sitio.
- Lo usan: `context/`, `hooks/`, `pages/`, `components/`.

## Estilo y convenciones
- Llamar con `api()`, nunca con `fetch` directo al backend.
- Alertas: skill `sileo-notificaciones`.

## No hacer
- Usar `VITE_OPENAI_API_KEY` en producción: queda en el bundle (EG-052).
- Pedir claves de servidor con prefijo `VITE_`.

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
