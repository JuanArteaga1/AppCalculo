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

## Despliegue en Vercel

La configuración vive en `vercel.json` (en esta carpeta) y en `../vercel.json`
(por si Vercel apunta a la raíz del repositorio en vez de a `vite-project/`).

### Ajustes en el panel de Vercel

| Campo | Valor |
| --- | --- |
| Framework Preset | Vite |
| Root Directory | `vite-project` (si el repo es `App-Calculo`) o vacío (si el repo es `AppCalculo`) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

Con `vercel.json` presente no hace falta tocar nada de esto a mano: Vercel lo lee del archivo.

### Rutas: por qué se caía al recargar

La app usa React Router en modo *history*, así que `/laboratorio` o
`/calculo1/limites/1.1` no existen como archivos en el servidor. Sin
configuración, Vercel devolvía **404 NOT_FOUND** en cualquier recarga que no
fuera la raíz. Lo resuelve el `rewrites` de `vercel.json`:

```json
"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
```

Vercel busca primero el archivo real (los `/assets/*` y las imágenes se siguen
sirviendo tal cual) y solo si no existe entrega `index.html`, que es donde el
router resuelve la ruta.

### Variables de entorno

En Vercel → Settings → Environment Variables, añade:

```
VITE_OPENAI_API_KEY = sk-...
```

Debe existir en los entornos **Production**, **Preview** y **Development**, y
hay que volver a desplegar para que el valor entre al bundle.

> **Cuidado:** todo lo que empieza por `VITE_` se incrusta en el JavaScript que
> descarga el navegador. Cualquiera puede leer esa clave desde las herramientas
> de desarrollo. Para uso real hay que mover la llamada a OpenAI a una función
> serverless (`/api`) que guarde la clave en el servidor.

### Comprobar el build de producción en local

```bash
npm run build && npm run preview
```

`vite preview` ya aplica el mismo *fallback* de SPA que Vercel, así que sirve
para confirmar que las rutas profundas cargan antes de desplegar.

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

### Producción en el servidor de la universidad

1. Publica `backend/` en el servidor con `NODE_ENV=production` y `CONFIAR_PROXY=true`.
2. Autoriza la IP del servidor en MongoDB Atlas.
3. Agrega esta regla en `vercel.json`, **antes** de la regla de `index.html`:

```json
{ "source": "/api/:ruta*", "destination": "https://SERVIDOR/api/:ruta*" }
```

4. Respalda la carpeta de imágenes (`CARPETA_ARCHIVOS`): no se guarda en MongoDB.

### Si la API no responde

El curso y los temas salen siempre de la API. No hay respaldo con `src/data/temas.js`: esa copia no conoce la visibilidad actual y podría mostrar temas privados, en papelera o eliminados.

- **Caída o sin conexión:** las páginas de Cálculo I y de tema muestran "Servicio no disponible" con un botón **Reintentar**. La petición fallida se repite sin recargar la página.
- **Tema privado o en papelera:** el backend responde 404 y la app muestra la página "No encontramos esta página". Un 404 nunca se confunde con una caída.
- **Sin respaldo:** no se muestran títulos, bloques, videos ni ejercicios guardados en el navegador. La videoteca también vive en MongoDB y solo se sirve desde la API.
- **Visitas y progreso:** si el registro de visita falla, el tema igual se abre; solo se pierde esa marca.
