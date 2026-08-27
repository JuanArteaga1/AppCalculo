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
