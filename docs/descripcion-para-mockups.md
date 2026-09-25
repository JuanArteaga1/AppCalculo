# EDUCALC XE — Descripción estructural para mockups

> Documento de referencia para rehacer los mockups (wireframes) con el cliente.
> Describe **qué hay en cada pantalla, dónde está y cómo se comporta**. No incluye colores ni estilos visuales: está pensado para dibujarse en escala de grises.

---

## 0. Qué es la aplicación

EDUCALC XE es una plataforma educativa web para estudiantes universitarios de **Cálculo Diferencial (Cálculo I)**. Organiza el curso en 3 unidades (Límites y Continuidad, Derivadas, Aplicaciones de la Derivada), con 31 temas en total. Cada tema combina:

- explicación teórica con fórmulas matemáticas,
- ejercicios que se resuelven paso a paso con animación (tablas y gráficas),
- videos de apoyo,
- un laboratorio de graficación tipo GeoGebra,
- un asistente (chat con IA) que resuelve ejercicios.

Además tiene una sección de **Saberes Previos** (repaso de matemáticas básicas) y una **Biblioteca Multimedia** de videos.

### Mapa de pantallas

| # | Pantalla | Ruta | Tiene barra superior y pie |
|---|----------|------|----------------------------|
| 1 | Inicio | `/` | Sí |
| 2 | Saberes Previos | `/saberes-previos` | Sí |
| 3 | Cálculo I (vista general) | `/calculo1` | Sí |
| 4 | Unidad | `/calculo1/:unidad` | Sí |
| 5 | Tema (lección) | `/calculo1/:unidad/:tema` | Sí |
| 6 | Laboratorio | `/laboratorio` | **No** (pantalla completa) |
| 7 | Biblioteca Multimedia | `/biblioteca` | Sí |

### Flujo principal del estudiante

```
Inicio ──► Cálculo I ──► Unidad ──► Tema ──► Laboratorio (pantalla completa)
   │                                  │            │
   │                                  │            └── "← Volver al tema"
   │                                  ├──► Saberes Previos (repaso)
   │                                  └──► Videos de apoyo (dentro del tema)
   └──► Saberes Previos
Barra superior ──► Biblioteca Multimedia (en cualquier momento)
```

---

## 1. Elementos globales

### 1.1 Barra de navegación (arriba, en todas las pantallas excepto Laboratorio)

Fija en la parte superior, ocupa todo el ancho.

**Escritorio (≥ 1080 px):**

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [logo] EDUCALC XE          Inicio  Saberes Previos  Cálculo I             │
│        Plataforma Educativa         Laboratorio  Biblioteca   [Comenzar]  │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Izquierda:** logotipo + nombre "EDUCALC XE" con subtítulo pequeño "Plataforma Educativa". Clic → Inicio.
- **Centro/derecha:** 5 enlaces: Inicio, Saberes Previos, Cálculo I, Laboratorio, Biblioteca. El enlace de la página actual aparece marcado (subrayado o resaltado).
- **Extremo derecho:** botón de llamada a la acción **"Comenzar"** → lleva a Cálculo I.

**Móvil / tableta (< 1080 px):**

- Se ve solo logo + nombre a la izquierda y un **botón hamburguesa (☰)** a la derecha.
- Al tocarlo, el icono cambia a **✕** y se despliega debajo un menú a todo el ancho con los 5 enlaces en lista vertical y el botón "Comenzar" al final.
- Al elegir una opción el menú se cierra.

### 1.2 Pie de página (abajo, en todas las pantallas excepto Laboratorio)

4 columnas en escritorio; en móvil se apilan una debajo de otra.

| Columna 1 — Marca | Columna 2 — Contenido | Columna 3 — Plataforma | Columna 4 — Contacto |
|---|---|---|---|
| Logo + "EDUCALC XE" | Saberes Previos | Inicio | soporte@educalcxe.edu |
| "Plataforma Educativa de Cálculo" | Límites y Continuidad | Cálculo I | +57 (1) 234 5678 |
| Párrafo corto que describe la plataforma | Derivadas | Laboratorio | Bogotá, Colombia |
| | Aplicaciones | Biblioteca Multimedia | |

Debajo de las columnas, una línea separadora y el texto de derechos de autor centrado.

### 1.3 Comportamientos generales

- Las fórmulas matemáticas se muestran siempre en notación matemática real (fracciones, raíces, límites, exponentes), nunca como texto plano tipo `x^2`.
- En móvil no debe existir desplazamiento horizontal de la página; las tablas anchas se desplazan dentro de su propia caja.
- Recargar cualquier página mantiene al usuario en ella (no lo devuelve a Inicio).

---

## 2. Pantalla: Inicio (`/`)

Orden vertical de arriba hacia abajo:

### 2.1 Hero (bloque principal)

```
┌─────────────────────────────────────────────────────────────┐
│ ( Plataforma Educativa Universitaria )   ← etiqueta/insignia │
│                                                             │
│ Cálculo Diferencial de forma                                │
│ visual e interactiva                     ← título grande    │
│                                                             │
│ Párrafo de 2–3 líneas explicando la propuesta              │
│                                                             │
│ [ Explorar cursos ]   [ Saberes previos ]                   │
└─────────────────────────────────────────────────────────────┘
```

- Botón principal "Explorar cursos" → Cálculo I.
- Botón secundario "Saberes previos" → Saberes Previos.

### 2.2 Carrusel de imágenes

- Una imagen/animación grande a la vez (actualmente 2: una animación GIF y la mascota "Quimerito").
- Flecha **‹** a la izquierda y **›** a la derecha, superpuestas a la imagen.
- **Puntos indicadores** debajo (uno por imagen; el activo destacado). Clic en un punto salta a esa imagen.
- En móvil se puede **deslizar con el dedo**.

### 2.3 Tarjetas de las 3 unidades

Fila de 3 tarjetas (en móvil, una debajo de otra):

```
┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐
│ [mini gráfica│ │ [mini gráfica│ │ [mini gráfica        │
│  animada]    │ │  animada]    │ │  animada]            │
│ Límites      │ │ Derivadas    │ │ Aplicación de la     │
│              │ │              │ │ Derivada             │
└──────────────┘ └──────────────┘ └──────────────────────┘
```

- Cada tarjeta tiene un pequeño dibujo animado que representa el concepto (curva acercándose a un punto; recta tangente; curva con máximo/mínimo).
- Clic → pantalla de la unidad correspondiente.

---

## 3. Pantalla: Saberes Previos (`/saberes-previos`)

### 3.1 Encabezado
- Etiqueta pequeña "Preparación".
- Título "Saberes Previos".
- Párrafo explicando que son los conocimientos necesarios antes de Cálculo I.

### 3.2 Cuadrícula de 6 tarjetas desplegables (acordeón)

Cuadrícula de 2–3 columnas en escritorio, 1 en móvil.

| Tarjeta | Estado cerrado | Estado abierto |
|---|---|---|
| Aritmética y Álgebra Básica | icono + título + botón **+** | lista de subtemas + nota "Material de repaso disponible próximamente"; el botón cambia a **−** |
| Ecuaciones e Inecuaciones | igual | igual |
| Funciones y Gráficas | igual | igual |
| Trigonometría Esencial | igual | igual |
| Geometría Analítica | igual | igual |
| Pensamiento Lógico-Matemático | igual | igual |

### 3.3 Recuadro de ayuda al final
- Título "¿No recuerdas alguno de estos temas?" y texto que invita a repasar.

> Punto a validar con el cliente: los saberes aún **no tienen contenido propio** (solo lista de subtemas). Definir si cada uno tendrá su página de repaso.

---

## 4. Pantalla: Cálculo I — vista general (`/calculo1`)

### 4.1 Hero en dos columnas

```
┌───────────────────────────────┬──────────────────────────────┐
│ ( Curso principal )           │  ┌────────────────────────┐  │
│ Cálculo I                     │  │ Posición del cohete    │  │
│ Párrafo descriptivo           │  │   [parábola animada]   │  │
│                               │  │   ● punto B(t)         │  │
│ ┌────┐ ┌────┐ ┌────┐          │  │ B(t) = (x, y)          │  │
│ │ 3  │ │ 31 │ │ ∞  │          │  │ Pendiente m = …        │  │
│ │Uni-│ │Te- │ │Prác│          │  └────────────────────────┘  │
│ │dad.│ │mas │ │tica│          │                              │
│ └────┘ └────┘ └────┘          │                              │
└───────────────────────────────┴──────────────────────────────┘
```

- **Izquierda:** etiqueta "Curso principal", título "Cálculo I", descripción y 3 cifras: **3 Unidades · 31 Temas · ∞ Práctica**.
- **Derecha:** gráfica interactiva: una parábola ("Posición del cohete") con un punto que se mueve; muestra sus coordenadas B(t) y el valor de la **pendiente** en ese punto. Se puede interactuar con el ratón.
- En móvil la gráfica pasa debajo del texto.

### 4.2 Sección "Empecemos este viaje"

3 tarjetas de unidad, en fila (móvil: apiladas):

```
┌────────────────────────┐
│ [icono animado]        │
│ Límites y Continuidad  │
│ 9 temas                │
│            Explorar →  │
└────────────────────────┘
```

- Unidad 1: Límites y Continuidad — 9 temas.
- Unidad 2: Derivadas — 10 temas.
- Unidad 3: Aplicaciones de la Derivada — 12 temas.
- Clic → pantalla de la unidad.

---

## 5. Pantalla: Unidad (`/calculo1/limites`, `/derivadas`, `/aplicaciones`)

### 5.1 Migas de pan
`Cálculo I / Límites y Continuidad` (el primer tramo es enlace).

### 5.2 Encabezado de la unidad
- Icono animado de la unidad, título y descripción.

### 5.3 Cuerpo en dos columnas

```
┌──────────────────────────────────────────┬─────────────────────┐
│  LISTA DE TEMAS (2 columnas de tarjetas) │  ASISTENTE (chat)   │
│                                          │  — fijo al hacer    │
│ ┌─────────────────┐ ┌─────────────────┐  │    scroll —         │
│ │ 01              │ │ 02              │  │                     │
│ │ Título del tema │ │ Título del tema │  │ Asistente de        │
│ │ Descripción     │ │ Descripción     │  │ Límites…            │
│ │ (Lección)     → │ │ (Lección)     → │  │ Pregunta cualquier  │
│ └─────────────────┘ └─────────────────┘  │ ejercicio…          │
│ ┌─────────────────┐ ┌─────────────────┐  │ ┌─────────────────┐ │
│ │ 03 …            │ │ 04 …            │  │ │ mensajes        │ │
│ └─────────────────┘ └─────────────────┘  │ │ (scroll propio) │ │
│              …                           │ └─────────────────┘ │
│                                          │ [ Escribe tu…  ][➤] │
│                                          │ Consejos de uso     │
└──────────────────────────────────────────┴─────────────────────┘
```

**Columna izquierda — tarjetas de tema** (2 por fila; 1 en móvil):
- Número grande (01, 02, …), título, descripción corta, etiqueta "Lección" y flecha →.
- Clic → pantalla del tema.

**Columna derecha — Asistente (chat IA), ancho fijo (~380 px):**
- Se queda **pegado al hacer scroll** (acompaña al usuario mientras baja por los temas).
- Encabezado: "Asistente de {nombre de la unidad}" + subtítulo "Pregunta cualquier ejercicio de este tema. Te lo resuelvo paso a paso."
- Área de mensajes con scroll propio (la página **no** salta al chat al entrar). Arranca con un mensaje de bienvenida con ejemplos de preguntas.
- Mensajes del usuario a un lado y del asistente al otro; las respuestas incluyen fórmulas matemáticas y pasos numerados.
- Caja de texto con ejemplo: *"Escribe tu ejercicio o pregunta... Ej: 'Calcula el límite de x² cuando x→3'"* y botón **"Enviar ➤"**.
- Debajo, un recuadro de consejos de uso.
- Estados a dibujar: vacío (bienvenida), escribiendo/cargando, respuesta, error.

**Móvil:** el chat pasa debajo de la lista de temas (no queda fijo).

---

## 6. Pantalla: Tema / Lección (`/calculo1/:unidad/:tema`)

Es la pantalla más importante y más larga.

### 6.1 Migas de pan
`Cálculo I / Límites y Continuidad / Límites laterales`

### 6.2 Estructura en dos columnas

```
┌─────────────────────────────────────────────┬──────────────────┐
│ COLUMNA PRINCIPAL                           │ BARRA LATERAL    │
│                                             │ (fija al bajar)  │
│ ┌─ A. Contenido del tema ────────────────┐  │ ┌──────────────┐ │
│ │ [icono]              ( Lección 1.2 )   │  │ │ Recursos     │ │
│ │ Título del tema                        │  │ │ ▸ Contenido  │ │
│ │ Descripción                            │  │ │ ▸ Videos     │ │
│ │ ───────────────────────────────        │  │ │ ▸ Laboratorio│ │
│ │ Texto, fórmulas, ejemplos,             │  │ │ ▸ Saberes    │ │
│ │ ejercicios interactivos…               │  │ └──────────────┘ │
│ └────────────────────────────────────────┘  │ ┌──────────────┐ │
│ ┌─ B. Videos de apoyo ───────────────────┐  │ │ 💡 ¿No te    │ │
│ └────────────────────────────────────────┘  │ │ acuerdas?    │ │
│ ┌─ C. Laboratorio (lanzador) ────────────┐  │ │ [chip][chip] │ │
│ └────────────────────────────────────────┘  │ │ Repasar →    │ │
│                                             │ └──────────────┘ │
└─────────────────────────────────────────────┴──────────────────┘
```

En móvil la barra lateral pasa debajo del contenido.

### 6.3 Bloque A — Contenido del tema

**Cabecera de la tarjeta:** icono animado de la unidad, etiqueta "Lección {número}", título grande y descripción.

**Cuerpo:** texto de la lección con estos tipos de elementos (dibujar un ejemplo de cada uno):

| Elemento | Cómo se ve |
|---|---|
| Subtítulos | Encabezados de sección dentro de la lección |
| Párrafos | Texto corrido con fórmulas en línea |
| Fórmulas en bloque | Ecuación centrada en su propia línea (límites, fracciones, etc.) |
| Listas | Viñetas o pasos numerados ("Paso 1, Paso 2…") |
| Simplificación | Fórmulas con términos **tachados** para mostrar cancelaciones |
| Términos enlazados (glosario) | Palabras clave (p. ej. "límite", "asíntota", "continuidad") aparecen como enlace; **al pasar el cursor** muestran un globo con su definición corta; al hacer clic abren una fuente externa |
| Bloques "por la izquierda / por la derecha" | Dos columnas lado a lado comparando el límite lateral izquierdo y el derecho (en móvil, una debajo de otra) |
| Tabla animada de aproximación | Ver 6.4 |
| Ejercicio de asíntotas | Ver 6.5 |

#### 6.4 Componente: Tabla de aproximación a un límite (interactivo)

```
┌──────────────────────────────────────────────────────────────┐
│ Aproximación a x = 2                          [ ▶ Resolver ] │
├──────────────────────────────────────────────────────────────┤
│                 [ GRÁFICA ]                                  │
│   curva que se dibuja sola · línea vertical punteada en x=2  │
│   hueco (círculo vacío) en el punto · puntos que aparecen    │
├──────────────────────────────────────────────────────────────┤
│  x→2⁻   │  f(x)  ║  x→2⁺   │  f(x)  ║ (diferencia)          │
│  1.9    │  …     ║  2.1    │  …     ║  …                    │
│  1.99   │  …     ║  2.01   │  …     ║  …                    │
│  1.999  │  —     ║  2.001  │  —     ║  —   ← aún ocultas    │
│  1.9999 │  —     ║  2.0001 │  —     ║  —                    │
├──────────────────────────────────────────────────────────────┤
│ Pulsa Resolver para ver a qué valor se acerca la función.    │
└──────────────────────────────────────────────────────────────┘
```

Estados:
1. **Inicial:** gráfica vacía o tenue; filas atenuadas con "—"; texto de pista abajo; botón "▶ Resolver".
2. **Resolviendo:** el botón dice "Resolviendo…" (deshabilitado). Se revela **una fila por segundo**; la fila recién revelada queda resaltada y en la gráfica aparecen los dos puntos correspondientes (uno a cada lado).
3. **Terminado:** todas las filas visibles; conclusión abajo, p. ej. *"f(x) → 4 cuando x → 2 por ambos lados"*; el botón cambia a **"↺ Repetir"**.
4. **Variante "límites laterales":** la tabla tiene una 5.ª columna "diferencia"; la gráfica dibuja la rama izquierda y la derecha diferenciadas (con salto si no coinciden). Si los laterales no coinciden la conclusión dice: *"lím x→a⁻ = …  y  lím x→a⁺ = …: los laterales no coinciden, así que el límite no existe."*
5. **Variante estática:** sin botón; tabla y gráfica ya completas, título "Gráfica y tabla de aproximación en x = a".

#### 6.5 Componente: Cálculo de asíntotas (interactivo)

```
┌──────────────────────────────────────────────────────────────┐
│ Calcular las asíntotas de f(x) = (x²+2)/(x−2) [ ▶ Resolver ] │
├──────────────────────────────────────────────────────────────┤
│                    [ GRÁFICA ]                               │
│  curva que se dibuja · recta vertical x = 2 (con etiqueta)   │
│  recta horizontal y = k · recta oblicua y = mx + b           │
│  (todas punteadas y con su nombre escrito junto a la recta)  │
├──────────────────────────────────────────────────────────────┤
│ ┌ a) Asíntotas horizontales ─────────── [muestra de línea] ┐ │
│ │ lím x→∞ f(x) = …                                         │ │
│ │ Conclusión en una frase                                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌ b) Asíntotas verticales ───────────── [muestra de línea] ┐ │
│ └──────────────────────────────────────────────────────────┘ │
│ ┌ c) Asíntota oblicua ───────────────── [muestra de línea] ┐ │
│ │ m = lím f(x)/x = …    b = lím [f(x) − mx] = …            │ │
│ └──────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

- Al pulsar **Resolver**: la curva se dibuja (≈1,5 s) y después aparece **un paso por segundo** (a → b → c). Cada paso, al aparecer, hace visible su recta en la gráfica.
- **Relación paso ↔ gráfica:** cada bloque de paso lleva una pequeña muestra del trazo de su recta (vertical, horizontal u oblicua) para que el estudiante sepa cuál línea de la gráfica corresponde a ese paso. En el mockup: usar el mismo patrón/grosor de línea en la muestra y en la gráfica (o numerarlas).
- Si un tipo de asíntota **no existe**, su bloque se muestra en estilo neutro y explica por qué (p. ej. "Como ya hay asíntota horizontal, no puede haber oblicua: son excluyentes").
- Al terminar, el botón cambia a **"↺ Repetir"**.
- El tema 1.5 trae 3 ejemplos de este componente.

### 6.6 Bloque B — Videos de apoyo

```
┌──────────────────────────────────────────────────────────┐
│ Videos de apoyo                                          │
│ Explicación principal y recurso relacionado en un solo…  │
│ ┌──────────────────────────────────────────────────────┐ │
│ │               REPRODUCTOR (YouTube)                  │ │
│ └──────────────────────────────────────────────────────┘ │
│ ┌──────────────────┐ ┌──────────────────┐                │
│ │ [miniatura ▶ 8:32]│ │ [miniatura ▶ …]  │               │
│ │ (etiqueta)        │ │ (etiqueta)       │               │
│ │ Título            │ │ Título           │               │
│ │ Descripción       │ │ Descripción      │               │
│ └──────────────────┘ └──────────────────┘                │
└──────────────────────────────────────────────────────────┘
```

- Reproductor grande arriba; debajo, tarjetas de los videos del tema (miniatura con icono ▶ y duración, etiqueta, título, descripción).
- La tarjeta del video que se está reproduciendo aparece marcada como activa; clic en otra la carga en el reproductor.
- **Estado sin videos:** recuadro con icono 🎬 y texto "Videos de apoyo próximamente".

### 6.7 Bloque C — Lanzador del laboratorio

```
┌──────────────────────────────────────────────────────────┐
│ ( Laboratorio interactivo )                              │
│ Grafica y analiza este tema          ┌───────────────┐   │
│ Descripción breve                    │ [vista previa │   │
│ [ Abrir laboratorio ]                │  de gráfica]  │   │
│ Se abrirá con f(x) = (x²−4)/(x−2)    └───────────────┘   │
└──────────────────────────────────────────────────────────┘
```

- Botón "Abrir laboratorio" → pantalla Laboratorio, ya cargada con una función de ejemplo acorde al tema y con la herramienta de análisis adecuada (límite o derivada).

### 6.8 Barra lateral (fija al hacer scroll)

1. **Tarjeta "Recursos"** — índice con 4 enlaces que desplazan la página a cada sección: Contenido del tema · Videos de apoyo · Laboratorio · Saberes previos (cada uno con icono).
2. **Tarjeta "💡 ¿No te acuerdas?"** — texto "Antes de continuar, repasa estos conceptos previos…", 3–4 "chips" con los saberes previos que requiere la unidad (p. ej. Funciones y Gráficas, Álgebra Básica, Ecuaciones e Inecuaciones) y enlace **"Repasar saberes previos →"**.

> Nota: en la pantalla de Tema **no** aparece el chat; el chat está en la pantalla de Unidad. Validar con el cliente si también lo quiere aquí.

---

## 7. Pantalla: Laboratorio (`/laboratorio`) — tipo GeoGebra

Pantalla completa (ocupa el 100 % de la ventana, sin barra de navegación ni pie).

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [← Volver al tema]   Nombre del tema                                     │
├──────────────────────────┬───────────────────────────────────────────────┤
│ PANEL IZQUIERDO (~380px) │                                               │
│ ┌──────────────────────┐ │                 LIENZO DE GRÁFICA             │
│ │ f₃(x) = [_________]  │ │          (ejes, cuadrícula, curvas)           │
│ │        [Graficar ↵]  │ │                                               │
│ │ vista previa / error │ │                                    [ + ]      │
│ └──────────────────────┘ │                                    [ − ]      │
│ Funciones                │                                    [ ⌂ ]      │
│ ● f₁(x) = x²      ✎ ✕    │                                    [ ⛶ ]      │
│ ○ f₂(x) = sin x   ✎ ✕    │   x = 1.25  y = 1.56  ← lectura al pasar     │
│                          │                                               │
│ Análisis                 │                                               │
│ [Límite][Derivada][Ning.]│                                               │
│ Función: [f₁ ▾]          │     ┌──────────── TECLADO FLOTANTE ─────────┐ │
│ Punto a: [ 2 ]           │     │ ⠿ [123][f(x)]              [C] [−]    │ │
│ Resultado: lím = 4       │     │ ┌───────────┐ ┌─────────────────────┐ │ │
│ Tabla de aproximación    │     │ │ x  y  π   │ │ 7 8 9 ÷ ⌫           │ │ │
│ [✨ Explicar paso a paso │     │ │ x² xⁿ √   │ │ 4 5 6 × ‹           │ │ │
│      con IA]             │     │ │ ( ) |a|   │ │ 1 2 3 − ›           │ │ │
│                          │     │ └───────────┘ │ 0 . , + ↵           │ │ │
│                          │     │               └─────────────────────┘ │ │
│                          │     └───────────────────────────────────────┘ │
└──────────────────────────┴───────────────────────────────────────────────┘
```

### 7.1 Encabezado
- Solo botón **"← Volver al tema"** (o "← Volver a Cálculo I" si se entró directo) y el nombre del tema.

### 7.2 Panel izquierdo (de arriba hacia abajo)

1. **Entrada de función:** etiqueta `fₙ(x) =`, campo de texto y botón **"Graficar ↵"**. Debajo, una línea de altura fija que muestra la **vista previa en notación matemática** mientras se escribe, o el **mensaje de error** si la expresión no es válida. Enter también grafica.
2. **Lista "Funciones":** una fila por función graficada: punto indicador (clic = mostrar/ocultar la curva), expresión en notación matemática, botón ✎ (editar: la devuelve al campo de entrada) y ✕ (eliminar).
3. **Panel "Análisis":** pestañas **Límite | Derivada | Ninguna**.
   - *Límite:* seleccionar función y punto `a` → resultado del límite, límites laterales y tabla de aproximación.
   - *Derivada:* seleccionar función y punto `x₀` → derivada simbólica, valor de la pendiente y recta tangente dibujada en la gráfica.
   - Botón **"✨ Explicar paso a paso con IA"** → muestra una explicación generada, con pasos y fórmulas.

### 7.3 Lienzo de gráfica (derecha)
- Ejes, cuadrícula y todas las curvas visibles, cada una distinguible (en el mockup: distinto trazo o etiqueta f₁, f₂…).
- Controles en una esquina: **+** (acercar), **−** (alejar), **⌂** (vista inicial), **⛶** (pantalla completa).
- Arrastrar = mover; rueda o pellizco = zoom; pasar el cursor muestra coordenadas; clic en la gráfica fija el punto de análisis.

### 7.4 Teclado matemático flotante
- Ventana pequeña **flotante** en la parte baja, **siempre visible**, que se puede **arrastrar** desde el asa ⠿.
- Cabecera: pestañas **123** (números y operaciones) y **f(x)** (funciones: sin, cos, tan, ln, log, eˣ, √, etc.), botón **C** (limpiar) y **−** (minimizar).
- Cuerpo: bloque izquierdo de 3 columnas (variables, potencias, raíces, paréntesis, valor absoluto, π) y bloque derecho numérico de 5 columnas con ⌫ (borrar), ‹ › (mover cursor) y ↵ (graficar).
- Todo lo que se pulsa se escribe en el campo de entrada del panel izquierdo.

### 7.5 Móvil
- La gráfica ocupa la parte superior y el panel pasa debajo; botón **"Ocultar panel / Mostrar panel"** para dar más espacio a la gráfica. El teclado sigue flotando abajo.

---

## 8. Pantalla: Biblioteca Multimedia (`/biblioteca`)

```
┌──────────────────────────────────────────────────────────────┐
│ Biblioteca Multimedia                          5 / 22 vistos │
│ Descripción                                                  │
│ [🔍 Buscar videos…                                        ]  │
│ Categoría: (Todos)(Límites y Cont.)(Derivadas)(Aplicaciones) │
│ Nivel:     (Todos)(Básico)(Intermedio)(Avanzado)             │
│                                         [+ Agregar video]    │
├──────────────────────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│ │ [miniatura ▶]│ │ [miniatura ▶]│ │ [miniatura ▶]│           │
│ │ Título       │ │ Título       │ │ Título       │           │
│ │ categoría ·  │ │ …            │ │ …            │           │
│ │ nivel · dur. │ │              │ │              │           │
│ │ [✓ Marcar    │ │              │ │              │           │
│ │    visto]    │ │              │ │              │           │
│ └──────────────┘ └──────────────┘ └──────────────┘           │
└──────────────────────────────────────────────────────────────┘
```

- **Encabezado:** título, descripción y **contador de progreso** "N / 22 vistos".
- **Buscador** por texto.
- **Filtros** tipo botón-píldora: Categoría (Todos, Límites y Continuidad, Derivadas, Aplicaciones) y Nivel (Todos, Básico, Intermedio, Avanzado). La opción activa aparece marcada.
- **Cuadrícula de tarjetas** (3–4 por fila en escritorio, 1 en móvil): miniatura con ▶, título, categoría, nivel, duración y botón **"Marcar visto"** (al marcarlo cambia a estado "Visto" y sube el contador).
- **Reproductor:** al hacer clic en una tarjeta se abre el video (reproductor grande / ventana superpuesta) con botón para cerrar.
- **Agregar video propio:** formulario con enlace de YouTube, título, categoría y nivel → el video se suma a la cuadrícula (se guarda solo en el navegador del usuario).
- **Estado vacío:** mensaje cuando la búsqueda/filtros no devuelven resultados.

---

## 9. Contenido del curso (para rellenar los mockups)

**Unidad 1 — Límites y Continuidad (9 temas)**
1.1 Introducción – Definición de límite · 1.2 Límites laterales · 1.3 Propiedades de los límites de funciones · 1.4 Límites al infinito y en infinito · 1.5 Asíntotas verticales, horizontales y oblicuas · 1.6 Límites trigonométricos · 1.7 Continuidad · 1.8 Límites de funciones exponenciales y logarítmicas · 1.9 Discontinuidad removible y discontinuidad esencial

**Unidad 2 — Derivadas (10 temas)**
2.1 Introducción – Definición de derivada · 2.2 Interpretación geométrica y física de la derivada · 2.3 Reglas básicas de derivación · 2.4 Regla de la cadena · 2.5 Derivadas de funciones algebraicas · 2.6 Derivadas de funciones trigonométricas · 2.7 Derivadas de funciones exponenciales y logarítmicas · 2.8 Derivación implícita · 2.9 Derivadas de orden superior · 2.10 Diferenciales

**Unidad 3 — Aplicaciones de la Derivada (12 temas)**
3.1 Razones de cambio relacionadas · 3.2 Crecimiento y decrecimiento de funciones · 3.3 Máximos y mínimos relativos · 3.4 Concavidad y puntos de inflexión · 3.5 Criterio de la segunda derivada · 3.6 Optimización · 3.7 Teorema de Rolle · 3.8 Teorema del Valor Medio · 3.9 Regla de L'Hôpital · 3.10 Aproximación lineal y diferencial · 3.11 Análisis completo de funciones · 3.12 Aplicaciones en economía, física e ingeniería

(Los títulos exactos están en `src/data/temas.js`.)

---

## 10. Estados que conviene dibujar en los mockups

| Pantalla | Estados |
|---|---|
| Barra superior | escritorio · móvil cerrado · móvil con menú abierto |
| Saberes Previos | todas cerradas · una tarjeta abierta |
| Unidad | chat vacío · chat con conversación · chat cargando · chat con error |
| Tema – tabla de límite | inicial · resolviendo (fila 2 de 4) · terminado · laterales que no coinciden |
| Tema – asíntotas | inicial · paso a) visible · terminado |
| Tema – videos | con videos · sin videos ("próximamente") |
| Laboratorio | vacío · con 2–3 funciones · error de expresión · análisis de límite · análisis de derivada · explicación IA · teclado minimizado · móvil |
| Biblioteca | lista completa · con filtros aplicados · sin resultados · video abierto · formulario de agregar |

---

## 11. Puntos a validar con el cliente

1. ¿El chat IA debe estar también dentro de cada tema o solo en la vista de unidad?
2. ¿Los Saberes Previos tendrán contenido propio (páginas de repaso) o solo la lista de subtemas?
3. ¿Qué imágenes/mensajes quiere en el carrusel de Inicio?
4. ¿Se necesita registro/inicio de sesión para guardar el progreso (videos vistos, temas completados)? Hoy el progreso vive solo en el navegador.
5. ¿Quiere un indicador de progreso por unidad/tema (p. ej. "3 de 9 temas completados")?
6. ¿El laboratorio debe permitir guardar/compartir gráficas?
7. ¿Todos los temas deben tener ejercicios interactivos (tablas/gráficas animadas) o solo los de la Unidad 1?
