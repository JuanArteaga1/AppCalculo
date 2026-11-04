# vite-project/src/components/ — piezas compartidas y gráficas

## Contiene
| Archivo o carpeta | Qué hace |
| --- | --- |
| `admin/` | Editor de temas y gráficas del panel |
| `espacio/` | Paneles de estudiante y maestro |
| `laboratorio/` | Laboratorio y utilidades matemáticas |
| `tema/` | Render de un tema |
| `Navbar.jsx`, `Footer.jsx` | Marco público |
| `RutaProtegida.jsx` | Muestra pantallas según sesión y rol |
| `ErrorBoundary.jsx` | Captura errores de render; hoy nadie lo importa |
| `AnimatedIcon.jsx`, `HeroAnimation.jsx` | Ícono animado y animación de portada |
| `ChatSection.jsx`, `ChatbotWidget.jsx` | Tutor con OpenAI |
| `SaberesRelacionados.jsx`, `TemaVideo.jsx` | Apoyos de la página del tema |
| `TablaLimiteInteractiva.jsx`, `GraficaLimite.jsx` | Ejercicio animado de límites |
| `AsintotasInteractivas.jsx`, `GraficaEstatica.jsx` | Ejercicio de asíntotas y curva fija |
| `GraficaAsintotaDefinicion.jsx`, `GraficaDiscontinuidad.jsx` | Dibujos conceptuales |
| `GraficaConceptualInfinito.jsx`, `GraficaLimiteInfinito.jsx` | Dibujos conceptuales |

## Rutas y relaciones
- Usa: `laboratorio/` (cálculo), `services/`, `context/`, `data/`.
- Lo nuevo va aquí si lo comparten varias pantallas; si es de una zona, en su subcarpeta.

## Estilo y convenciones
- CSS propio: objeto `styles` o clases de `styles/panel.css`, con tokens de `index.css`.
- Gráficas por ancho: `ResizeObserver`, ignorando medidas ≤ 0 (un `<details>` cerrado mide 0).

## No hacer
- Dibujar con valores a mano: deben coincidir con lo que calcula `mathjs`.
- Usar `dangerouslySetInnerHTML` fuera de KaTeX y del render de temas.

## Probar
- `npx eslint src --max-warnings 0` y `npm run build`, desde `vite-project/`. Sin tests aún (EG-051).
