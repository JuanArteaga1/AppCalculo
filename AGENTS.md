# vite-project/ — la app EDUCALC XE y único repositorio git del proyecto

## Contiene
| Archivo o carpeta | Qué hace |
| --- | --- |
| `src/` | Frontend React |
| `backend/` | API Express con MongoDB; paquete npm aparte |
| `public/` | Archivos estáticos servidos tal cual |
| `docs/` | Documentación funcional y de diseño |
| `docx_images/` | Imágenes de un Word; nada las usa |
| `index.html` | Entrada; declara la Content-Security-Policy |
| `vite.config.js` | Proxy `/api` a `BACKEND_URL` o `localhost:5100` |
| `eslint.config.js` | Lint con reglas de React Compiler |
| `vercel.json` | Rutas desconocidas a `index.html` y cabeceras |
| `package.json`, `package-lock.json` | Dependencias del frontend |
| `.env.example` | Variables `VITE_*` del frontend |
| `.gitignore` | Ignora `.env`, `dist` y `backend/uploads` |
| `README.md` | Puesta en marcha y despliegue |
| `Historias de usuario.docx` | Historias de usuario originales |
| `estilo_pagina.md`, `teoria.md` | Notas de estilo visual y de teoría |
| `dist/`, `node_modules/`, `venv_docx/` | Generados; no se editan |

## Rutas y relaciones
- Reglas generales en `../AGENTS.md`; mapa en `../ia_contexto/spec/architecture.md`.

## No hacer
- Tocar `venv_docx/`: entorno Python para leer Word, ajeno a la app.
- Confiar en `npm run lint`: incluye `backend/` y falla ahí (EG-056).

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
