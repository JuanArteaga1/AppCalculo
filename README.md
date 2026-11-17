# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

---

## Despliegue: frontend en Vercel, backend en Render

Los dos salen de este mismo repositorio. El navegador solo habla con Vercel:
`vercel.json` reenvía `/api/*` al backend de Render. Así la cookie de sesión es
del mismo dominio que la app (funciona en iPhone, que bloquea cookies de
terceros) y la CSP `connect-src 'self'` no se toca.

```
Navegador ──> https://TU-APP.vercel.app ──/api/*──> https://educalc-api.onrender.com/api/*
```

### Vercel (frontend)

| Campo | Valor |
| --- | --- |
| Root Directory | vacío (la raíz del repo ya es esta carpeta) |
| Production Branch | `main` |
| Framework, Build, Output, Install | Los lee de `vercel.json` |

Variables de entorno: solo `VITE_DEMO_ESPACIOS=false`. Si quedó una
`VITE_OPENAI_API_KEY` de antes, bórrala y revoca esa clave: estuvo a la vista en
el bundle.

**Rutas al recargar.** La app usa React Router en modo *history*: `/laboratorio`
o `/calculo1/limites/1.1` no son archivos. El último `rewrites` de `vercel.json`
entrega `index.html` para cualquier ruta que no exista como archivo, y el router
la resuelve. Se quitó `cleanUrls`, que es para sitios de HTML estático y no hace
falta en una SPA. Si una recarga sigue dando `404: NOT_FOUND` de Vercel, el
despliegue no está leyendo este `vercel.json`: revisa Root Directory y que el
despliegue de producción salga de `main`.

**Backend.** El primer `rewrites` apunta a `https://educalc-api.onrender.com`. Si
Render le pone otro nombre al servicio, cambia esa URL y vuelve a desplegar.

### Render (backend)

Desde el mismo repo, sin separar nada:

1. Render → **New → Blueprint** → elige este repositorio. Lee `render.yaml`
   (servicio `educalc-api`, carpeta `backend`, `npm ci` y `npm start`, salud en
   `/api/salud`). Solo se vuelve a desplegar cuando cambia algo en `backend/`.
2. Render pide los valores marcados `sync: false`. Los escribes en el panel,
   nunca en el repo. `JWT_SECRET` lo genera Render.
3. En MongoDB Atlas → Network Access, autoriza `0.0.0.0/0`: el plan gratis de
   Render no tiene IP fija.
4. Copia la URL del servicio a `vercel.json` si no es la de arriba.

Sin Blueprint también sirve **New → Web Service** con Root Directory `backend`,
Build `npm ci`, Start `npm start` y las mismas variables.

| Variable | Valor |
| --- | --- |
| `NODE_ENV` | `production` (cookies `Secure`, sin atajos demo) |
| `CONFIAR_PROXY` | `2` (Vercel y el balanceador de Render) |
| `URL_APP` | `https://TU-APP.vercel.app`, sin barra final |
| `ORIGENES_PERMITIDOS` | La misma URL de Vercel |
| `USER_DB`, `PASS_DB`, `SERVER_DB` | Los de Atlas, o una sola `MONGO_URI` |
| `JWT_SECRET` | Generado por Render |
| `SMTP_*` | Ver «Correo en Render» |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Los de Google Cloud |
| `ADMIN_CORREOS`, `DOCENTE_CORREOS` | Correos con rol fijo |
| `GEMINI_API_KEY` | Clave del tutor |

En Google Cloud agrega la URI de redirección
`https://TU-APP.vercel.app/api/usuarios/google/callback`.

**Correo en Render.** El plan gratis bloquea los puertos SMTP 25, 465 y 587, así
que Gmail por el 587 no sale. Hay dos caminos sin tocar código:

- Usar un proveedor que acepte el puerto **2525**, por ejemplo Brevo:
  `SMTP_HOST=smtp-relay.brevo.com`, `SMTP_PORT=2525`, `SMTP_USER` y `SMTP_PASS`
  de Brevo → SMTP & API, y un `SMTP_REMITENTE` verificado en Brevo.
- Pasar el servicio a un plan pago de Render y dejar Gmail como está.

**Limitaciones del plan gratis.**
- Se duerme tras 15 minutos sin uso; la primera petición tarda cerca de un minuto.
- El disco se borra al dormir o redesplegar: las imágenes subidas a
  `CARPETA_ARCHIVOS` se pierden. Para conservarlas hace falta un disco de Render
  (plan pago) o guardarlas fuera del servidor.

### Comprobar el build de producción en local

```bash
npm run build && npm run preview
```

`vite preview` aplica el mismo *fallback* de SPA que Vercel y también reenvía
`/api` al backend local.

---

## Backend

Vive en `backend/` y usa MongoDB. Toda la API cuelga de `/api`.

```bash
cd backend
npm install
npm run dev
```

`npm run dev` reinicia el backend cada vez que guardas un archivo. En el servidor se usa `npm start`. Si cambias el `.env`, reinícialo a mano.

La primera vez, copia `backend/.env.example` a `backend/.env`, llena los datos y carga los temas:

```bash
npm run migrar-temas
```

En desarrollo, Vite redirige `/api` a `http://localhost:5100`.

¿Sin Atlas? Con un MongoDB local en el equipo, basta una línea en `backend/.env`:
`MONGO_URI=mongodb://127.0.0.1:27017/PlataformaEducativa`. Tiene prioridad sobre
`USER_DB`, `PASS_DB` y `SERVER_DB` y también la usan los scripts de migración.

### Ingreso con Google

El botón **Continuar con Google** de `/acceso` inicia sesión con la cuenta
institucional. Solo acepta correos `@uniautonoma.edu.co`; el dominio se valida
en el servidor, no en el navegador.

1. En [Google Cloud](https://console.cloud.google.com/) crea un proyecto y
   configura la pantalla de consentimiento.
2. En **APIs y servicios → Credenciales → Crear credenciales → ID de cliente de
   OAuth**, elige **Aplicación web**.
3. En **URI de redirección autorizados** agrega
   `http://localhost:5173/api/usuarios/google/callback` en desarrollo y
   `https://TU_DOMINIO/api/usuarios/google/callback` en producción.
4. Copia el cliente y el secreto en `backend/.env`:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
URL_APP=http://localhost:5173
# Opcional: solo si el proxy usa otro dominio.
GOOGLE_REDIRECT_URI=
```

Sin esas variables, el botón vuelve con el aviso "Google todavía no está
configurado" y el acceso por contraseña sigue funcionando.

Roles al entrar con Google (definidos en `backend/lib/google.js`):

| Correo | Rol |
| --- | --- |
| `ADMIN_CORREOS` (por defecto `estiven.realpe.h@uniautonoma.edu.co`) | administrador |
| `DOCENTE_CORREOS` (por defecto `juan.arteaga.f@uniautonoma.edu.co`) | docente |
| Cualquier otro correo del dominio | estudiante |

Las cuentas existentes conservan su rol: la lista solo asciende, nunca degrada
a un administrador, y una cuenta `pendiente` pasa a `activo` al entrar con
Google. Ambas listas admiten varios correos separados por comas.

> **Acceso de prueba:** el cuadro "Acceso de prueba · sesión automática" del
> login abre sesión con las cuentas `prueba.*` que crea
> `npm run crear-usuarios-prueba`, siempre que `DEMO_ACCESO=true` en
> `backend/.env`. La ruta `/api/usuarios/demo` responde 404 en producción y los
> botones solo se muestran en desarrollo o con `VITE_DEMO_ESPACIOS=true`.

### Producción

Ver «Despliegue: frontend en Vercel, backend en Render». Si un día el backend
se muda al servidor de la universidad, basta cambiar la URL del primer
`rewrites` de `vercel.json` y respaldar `CARPETA_ARCHIVOS`.

### Si la API no responde

El curso y los temas salen siempre de la API. No hay respaldo con `src/data/temas.js`: esa copia no conoce la visibilidad actual y podría mostrar temas privados, en papelera o eliminados.

- **Caída o sin conexión:** las páginas de Cálculo I y de tema muestran "Servicio no disponible" con un botón **Reintentar**. La petición fallida se repite sin recargar la página.
- **Tema privado o en papelera:** el backend responde 404 y la app muestra la página "No encontramos esta página". Un 404 nunca se confunde con una caída.
- **Sin respaldo:** no se muestran títulos, bloques, videos ni ejercicios guardados en el navegador. La videoteca también vive en MongoDB y solo se sirve desde la API.
- **Visitas y progreso:** si el registro de visita falla, el tema igual se abre; solo se pierde esa marca.
