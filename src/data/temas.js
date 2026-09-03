// Estructura completa de temas de Cálculo 1
// Unidad 1: Límites y Continuidad
// Unidad 2: Derivadas
// Unidad 3: Aplicaciones de la Derivada

export const unidades = [
  {
    id: 'limites',
    titulo: 'Límites y Continuidad',
    descripcion: '¿Qué sucede cuando nos acercamos cada vez más a un punto? Los límites te permiten descubrir y comprender qué ocurre cerca de un valor determinado, incluso cuando no llegamos exactamente a él. Aquí comienza el camino hacia el cálculo diferencial.',
    icono: '∞',
    color: '#0047CC',
    temas: [
      {
        id: '1.1',
        titulo: 'Introducción – Definición de límite',
        descripcion: 'Explora el concepto de límite a través de un ejemplo paso a paso y descubre qué sucede con una función cuando la variable se acerca cada vez más a un punto, incluso cuando la función no está definida allí.',
        contenido: `
## Introducción

Considere la [función](https://es.wikipedia.org/wiki/Funci%C3%B3n_matem%C3%A1tica):

$$f(x) = \\frac{16 - x^2}{4 - x}$$

Su dominio son todos los números reales excepto $x = 4$, porque en ese punto el denominador se anula. La pregunta que responde el [límite](https://es.wikipedia.org/wiki/L%C3%ADmite_de_una_funci%C3%B3n) no es cuánto vale la función en 4, sino **a qué valor se acerca** cuando $x$ se aproxima a 4.

## Paso 1: intentar la sustitución directa

Lo primero que se prueba siempre es reemplazar el valor en la función:

$$f(4) = \\frac{16 - 4^2}{4 - 4} = \\frac{16 - 16}{0} = \\frac{0}{0}$$

El resultado es una **[indeterminación](https://es.wikipedia.org/wiki/Forma_indeterminada)**. No significa que el límite no exista: significa que la sustitución directa no alcanza para responder y hay que analizar el comportamiento alrededor del punto.

## Paso 2: acercarse al punto por ambos lados

Si no podemos evaluar en 4, evaluamos *cerca* de 4: primero con valores un poco menores (por la izquierda) y luego con valores un poco mayores (por la derecha). Cada fila se acerca diez veces más que la anterior.

[[tabla-limite expr=(16-x^2)/(4-x) punto=4]]

Los dos lados se acercan al mismo número, y ese número es **8**. Ninguna fila llega a $x = 4$: nos acercamos tanto como queramos sin tocar el punto.

## Paso 3: comprobarlo con álgebra

La tabla sugiere el resultado; el álgebra lo demuestra. El numerador es una diferencia de cuadrados, así que se puede factorizar:

$$f(x) = \\frac{16 - x^2}{4 - x} = \\frac{\\cancel{(4 - x)}(4 + x)}{\\cancel{4 - x}} = 4 + x$$

El factor $(4 - x)$ se cancela arriba y abajo. Esa cancelación es válida para todo $x \\neq 4$, que es justamente donde estamos trabajando: alrededor del punto, nunca en él.

## Paso 4: conclusión

Con la función ya simplificada, la sustitución directa sí funciona:

$$\\lim_{x \\to 4} \\frac{16 - x^2}{4 - x} = \\lim_{x \\to 4} (4 + x) = 8$$

El límite existe y vale **8**, aunque $f(4)$ no esté definida: el límite y la [continuidad](https://es.wikipedia.org/wiki/Funci%C3%B3n_continua) son cosas distintas. Gráficamente, la curva es la recta $y = 4 + x$ con un agujero en el punto $(4, 8)$.
        `
      },
      {
        id: '1.2',
        titulo: 'Límites laterales',
        descripcion: 'Estudian el comportamiento de la función desde un solo lado: por la izquierda o por la derecha.',
        contenido: `
## Introducción

Hasta ahora nos acercamos al punto por los dos lados a la vez. Pero, ¿qué pasa si la función
hace una cosa por la izquierda y otra distinta por la derecha? Para eso existen los
**límites laterales**: miran cada lado por separado.

Considere esta función definida por partes:

$$f(x) = \\begin{cases} 3, & \\text{si } x < 2 \\\\ 7, & \\text{si } x > 2 \\end{cases}$$

## Paso 1: mirar cada lado por separado

Por la izquierda la función vale siempre 3, por cerca que estemos de 2. Por la derecha vale
siempre 7. Los dos lados son constantes, pero **constantes distintas**.

$$\\lim_{x \\to 2^{-}} f(x) = 3 \\qquad \\lim_{x \\to 2^{+}} f(x) = 7$$

## Paso 2: comprobarlo con la tabla

La columna de diferencia es la clave: si el límite existiera, esa diferencia tendría que
acercarse a cero conforme nos pegamos al punto. Aquí se queda clavada en 4.

[[tabla-limite expr=x < 2 ? 3 : 7 punto=2 modo=laterales]]

## Paso 3: qué significa el salto

En la gráfica hay una rama azul a la altura 3 y otra roja a la altura 7, con un salto en
$x = 2$. Los dos extremos se dibujan como círculos huecos porque la función no llega a tomar
esos valores viniendo del otro lado.

## Paso 4: conclusión

Para que exista el límite hacen falta dos cosas: que exista cada lateral **y** que ambos
valgan lo mismo.

$$\\lim_{x \\to 2^{-}} f(x) \\neq \\lim_{x \\to 2^{+}} f(x) \\implies \\lim_{x \\to 2} f(x) \\text{ no existe}$$

Esta ruptura se llama **discontinuidad de salto**, y es distinta de la removible del
[tema anterior](/calculo1/limites/1.1): allí el límite sí existía y solo faltaba el valor
en el punto.
        `
      },
      {
        id: '1.3',
        titulo: 'Propiedades de los límites de funciones',
        descripcion: 'Las propiedades permiten simplificar cálculos complejos sin resolver toda la función desde cero.',
        contenido: `
## Introducción

Si conocemos los límites de dos [funciones](/saberes-previos#funciones), podemos calcular límites más complejos usando propiedades algebraicas.

## Propiedades

Sean $\\lim_{x \\to a} f(x) = L$ y $\\lim_{x \\to a} g(x) = M$:

### 1. Suma
$$\\lim_{x \\to a} [f(x) + g(x)] = L + M$$

### 2. Resta
$$\\lim_{x \\to a} [f(x) - g(x)] = L - M$$

### 3. Multiplicación
$$\\lim_{x \\to a} [f(x) \\cdot g(x)] = L \\cdot M$$

### 4. Cociente
$$\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\frac{L}{M}, \\quad M \\neq 0$$

### 5. Potencias
$$\\lim_{x \\to a} [f(x)]^n = L^n$$

## Ejemplo práctico

Calcular: $\\lim_{x \\to 2} (x^3 + 4x - 1)$

Usando la propiedad de suma:
$$\\lim_{x \\to 2} x^3 + \\lim_{x \\to 2} 4x - \\lim_{x \\to 2} 1 = 8 + 8 - 1 = 15$$
        `
      },
      {
        id: '1.4',
        titulo: 'Límites al infinito y en infinito',
        descripcion: 'Analizan el comportamiento extremo de una función cuando x crece o decrece sin límite.',
        contenido: `
## Introducción

Analizan el comportamiento extremo de una [función](/saberes-previos#funciones) cuando la [variable independiente](/saberes-previos#variables) crece o decrece sin límite.

## Límite al infinito

Cuando $x$ crece o decrece sin límite:

$$\\lim_{x \\to \\infty} \\frac{1}{x} = 0$$

## Límite en infinito

Cuando una [función](/saberes-previos#funciones) crece indefinidamente cerca de un punto:

$$\\lim_{x \\to 0^+} \\frac{1}{x} = +\\infty$$

$$\\lim_{x \\to 0^-} \\frac{1}{x} = -\\infty$$

## Aplicaciones reales

- **Crecimiento poblacional:** Modelos exponenciales
- **Intereses financieros:** [Interés compuesto](/calculo1/derivadas/2.7)
- **Sistemas físicos:** Comportamiento a largo plazo
        `
      },
      {
        id: '1.5',
        titulo: 'Asíntotas verticales, horizontales y oblicuas',
        descripcion: 'Rectas a las que una función se aproxima cada vez más sin nunca tocarlas.',
        contenido: `
## Introducción

Las [asíntotas](/calculo1/limites/1.4) son rectas a las que una [función](/saberes-previos#funciones) se aproxima cada vez más sin nunca tocarlas.

## Asíntotas verticales

Ocurren cuando el denominador se hace cero y el [límite](/calculo1/limites/1.1) tiende a infinito.

$$f(x) = \\frac{1}{x - 1} \\implies \\text{Asíntota: } x = 1$$

## Asíntotas horizontales

Se estudian con [límites](/calculo1/limites/1.4) al infinito:

$$\\lim_{x \\to \\infty} \\frac{2x + 1}{x} = 2 \\implies \\text{Asíntota: } y = 2$$

## Asíntotas oblicuas

Cuando el grado del [polinomio](/saberes-previos#polinomios) numerador es uno mayor que el denominador:

$$f(x) = \\frac{x^2 + 1}{x} = x + \\frac{1}{x} \\implies \\text{Asíntota: } y = x$$

## Aplicación

Las [asíntotas](/calculo1/limites/1.4) son fundamentales en el [análisis completo de funciones](/calculo1/aplicaciones/3.11).
        `
      },
      {
        id: '1.6',
        titulo: 'Límites trigonométricos',
        descripcion: 'Límites fundamentales para derivadas y análisis matemático.',
        contenido: `
## Introducción

Son [límites](/calculo1/limites/1.1) fundamentales que aparecen en el cálculo de [derivadas](/calculo1/derivadas/2.1) de [funciones trigonométricas](/saberes-previos#trigonometria).

## Límite fundamental

$$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$$

## Otros límites importantes

$$\\lim_{x \\to 0} \\frac{\\tan(x)}{x} = 1$$

$$\\lim_{x \\to 0} \\frac{1 - \\cos(x)}{x} = 0$$

## Aplicación en derivadas

Estos [límites](/calculo1/limites/1.1) son esenciales para demostrar las [fórmulas de derivación](/calculo1/derivadas/2.6):
- $\\frac{d}{dx}\\sin(x) = \\cos(x)$
- $\\frac{d}{dx}\\cos(x) = -\\sin(x)$

## Aplicaciones reales
- Ondas y sonido
- Electricidad alternada
- Ingeniería civil
        `
      },
      {
        id: '1.7',
        titulo: 'Continuidad',
        descripcion: 'Condición de continuidad en un punto: límite igual al valor de la función.',
        contenido: `
## Introducción

Una [función](/saberes-previos#funciones) es continua en un punto si no tiene interrupciones. Esto se relaciona directamente con el concepto de [límite](/calculo1/limites/1.1).

## Definición formal

Una [función](/saberes-previos#funciones) $f$ es continua en $x = a$ si se cumplen tres condiciones:

1. $f(a)$ está definida.
2. $\\lim_{x \\to a} f(x)$ existe.
3. $\\lim_{x \\to a} f(x) = f(a)$

## Tipos de discontinuidad

### Discontinuidad removible
Existe el [límite](/calculo1/limites/1.1), pero $f(a)$ no coincide.

### Discontinuidad por salto
Los [límites laterales](/calculo1/limites/1.3) son diferentes.

### Discontinuidad infinita
La función tiende a $\\pm\\infty$.

## Ejemplo

$f(x) = x^2$ es continua en todo punto porque no tiene interrupciones.

$$\\lim_{x \\to 2} x^2 = 4 = f(2)$$
        `
      },
      {
        id: '1.8',
        titulo: 'Límites de funciones exponenciales y logarítmicas',
        descripcion: 'Comportamiento de límites cuando participan funciones exponenciales y logarítmicas.',
        contenido: `
## Introducción

Estudiamos el comportamiento de los [límites](/calculo1/limites/1.1) cuando participan [funciones exponenciales](/saberes-previos#exponenciales) y [funciones logarítmicas](/saberes-previos#logaritmos).

## Funciones exponenciales

### Límite fundamental
$$\\lim_{x \\to \\infty} e^x = \\infty$$
$$\\lim_{x \\to -\\infty} e^x = 0$$

### Con base general
$$\\lim_{x \\to \\infty} a^x = \\infty \\quad (\\text{si } a > 1)$$
$$\\lim_{x \\to \\infty} a^x = 0 \\quad (\\text{si } 0 < a < 1)$$

## Funciones logarítmicas

### Límite fundamental
$$\\lim_{x \\to \\infty} \\ln(x) = \\infty$$
$$\\lim_{x \\to 0^+} \\ln(x) = -\\infty$$

## Ejemplo práctico

$$\\lim_{x \\to \\infty} \\frac{e^x}{x^2} \\to \\frac{\\infty}{\\infty}$$

Aplicando [Regla de L'Hôpital](/calculo1/aplicaciones/3.9) dos veces:
$$\\lim_{x \\to \\infty} \\frac{e^x}{2x} = \\lim_{x \\to \\infty} \\frac{e^x}{2} = \\infty$$

## Ejemplo con logaritmo

$$\\lim_{x \\to \\infty} \\frac{\\ln(x)}{x} = 0$$

El [logaritmo](/saberes-previos#logaritmos) crece más lento que cualquier [polinomio](/saberes-previos#polinomios).

## Aplicación
- Crecimiento poblacional
- [Interés compuesto](/calculo1/derivadas/2.7)
- Decaimiento radiactivo
        `
      },
      {
        id: '1.9',
        titulo: 'Discontinuidad removible y discontinuidad esencial',
        descripcion: 'Clasificación de los tipos de discontinuidad que puede presentar una función.',
        contenido: `
## Discontinuidad removible

Existe límite, pero el punto está mal definido.

Ejemplo: (x² - 9)/(x - 3) → Se simplifica a x + 3. Hueco en x = 3.

## Discontinuidad esencial

No existe límite único o tiende a infinito.

### Ejemplo salto
f(x) = { 1 si x < 0; 4 si x > 0 }

### Ejemplo infinita
f(x) = 1/x

## Conclusión

Los límites estudian hacia dónde va una función; la continuidad analiza si llega sin interrupciones.
        `
      }
    ]
  },
  {
    id: 'derivadas',
    titulo: 'Derivadas',
    descripcion: 'Mide cómo cambia una función en un instante específico. Representa la razón de cambio instantánea y la pendiente de la recta tangente.',
    icono: '∂',
    color: '#2563EB',
    temas: [
      {
        id: '2.1',
        titulo: 'Introducción – Definición de derivada',
        descripcion: 'La derivada indica qué tan rápido cambia una cantidad en un momento determinado.',
        contenido: `
## Introducción

La [derivada](/calculo1/derivadas/2.1) es uno de los conceptos más importantes del cálculo diferencial, ya que mide cómo cambia una [función](/saberes-previos#funciones) en un instante específico. Representa la razón de cambio instantánea.

## Definición formal

$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

Donde:
- $f(x+h) - f(x)$ representa el cambio en la [función](/saberes-previos#funciones).
- $h$ representa un cambio muy pequeño en $x$.

## Interpretación práctica

Si $d(t) = t^2$ (distancia), entonces $d'(t) = 2t$ (velocidad).

En $t = 3$: $v = 2(3) = 6$ unidades/segundo.

## Importancia
- Ingeniería
- Física
- Economía
- Biología
- Inteligencia artificial
        `
      },
      {
        id: '2.2',
        titulo: 'Interpretación geométrica y física de la derivada',
        descripcion: 'Geométricamente es la pendiente de la recta tangente; físicamente es velocidad y aceleración.',
        contenido: `
## Interpretación geométrica

Geométricamente, la [derivada](/calculo1/derivadas/2.1) representa la pendiente de la [recta tangente](/saberes-previos#recta-tangente) a una curva en un punto.

- Pendiente positiva → la [función](/saberes-previos#funciones) crece.
- Pendiente negativa → la [función](/saberes-previos#funciones) decrece.
- Pendiente cero → punto [máximo o mínimo](/calculo1/aplicaciones/3.3).

**Ejemplo:** $f(x) = x^2 \\implies f'(x) = 2x$

En $x = 2$: $f'(2) = 4$. La pendiente de la tangente es 4.

## Interpretación física

### Velocidad instantánea
Si $s(t) = t^2 + 3t$, entonces:
$$v(t) = s'(t) = 2t + 3$$

### Aceleración
$$a(t) = v'(t)$$

## Aplicación real
- Movimiento de vehículos
- Caída libre
- Electricidad
- [Costos marginales](/calculo1/aplicaciones/3.12)
        `
      },
      {
        id: '2.3',
        titulo: 'Reglas básicas de derivación',
        descripcion: 'Permiten derivar funciones sin usar siempre la definición por límite.',
        contenido: `
## Introducción

Permiten derivar [funciones](/saberes-previos#funciones) sin usar siempre la [definición por límite](/calculo1/derivadas/2.1).

## Reglas fundamentales

### 1. Derivada de constante
$$\\frac{d}{dx}(c) = 0$$

### 2. Regla de potencia
$$\\frac{d}{dx}(x^n) = n \\cdot x^{n-1}$$

**Ejemplo:** $\\frac{d}{dx}(x^4) = 4x^3$

### 3. Suma y resta
$$(f \\pm g)' = f' \\pm g'$$

### 4. Multiplicación (regla del producto)
$$(fg)' = f'g + fg'$$

### 5. División (regla del cociente)
$$\\left(\\frac{f}{g}\\right)' = \\frac{f'g - fg'}{g^2}$$

## Ejemplo práctico

$$f(x) = x^2 + 3x \\implies f'(x) = 2x + 3$$
        `
      },
      {
        id: '2.4',
        titulo: 'Regla de la cadena',
        descripcion: 'Se utiliza cuando una función está dentro de otra función (funciones compuestas).',
        contenido: `
## Introducción

Se utiliza cuando una [función](/saberes-previos#funciones) está dentro de otra [función](/saberes-previos#funciones) (funciones compuestas).

## Fórmula

$$\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$$

## Ejemplo paso a paso

$$y = (3x + 2)^4$$

**Paso 1:** Función externa $\\to u^4$

**Paso 2:** Interna $\\to u = 3x + 2$

**Derivada:**
$$y' = 4(3x + 2)^3 \\cdot (3) = 12(3x + 2)^3$$

## Aplicación real
- Temperatura compuesta
- Modelos biológicos
- [Optimización](/calculo1/aplicaciones/3.6)
        `
      },
      {
        id: '2.5',
        titulo: 'Derivadas de funciones algebraicas',
        descripcion: 'Incluye polinomiales, racionales y radicales.',
        contenido: `
## Introducción

Incluye [funciones polinomiales](/saberes-previos#polinomios), [racionales](/saberes-previos#racionales) y [radicales](/saberes-previos#radicales).

## Funciones polinomiales

$$f(x) = 4x^3 - 2x + 7 \\implies f'(x) = 12x^2 - 2$$

## Funciones racionales

$$f(x) = \\frac{x + 1}{x - 2}$$

Usamos la [regla del cociente](/calculo1/derivadas/2.3).

## Funciones radicales

$$f(x) = \\sqrt{x} = x^{1/2} \\implies f'(x) = \\frac{1}{2\\sqrt{x}}$$

## Aplicación
Diseño estructural, áreas, volúmenes.
        `
      },
      {
        id: '2.6',
        titulo: 'Derivadas de funciones trigonométricas',
        descripcion: 'Derivadas de seno, coseno, tangente y sus funciones inversas.',
        contenido: `
## Introducción

[Derivadas](/calculo1/derivadas/2.1) de [funciones trigonométricas](/saberes-previos#trigonometria) básicas y sus inversas.

## Principales

$$\\frac{d}{dx}(\\sin x) = \\cos x$$

$$\\frac{d}{dx}(\\cos x) = -\\sin x$$

$$\\frac{d}{dx}(\\tan x) = \\sec^2 x$$

## Trigonométricas inversas

$$\\frac{d}{dx}(\\arcsin x) = \\frac{1}{\\sqrt{1 - x^2}}$$

## Ejemplo práctico

$$f(x) = \\sin x + x^2 \\implies f'(x) = \\cos x + 2x$$

## Aplicación
- Ondas
- Circuitos
- Sonido
- Ingeniería
        `
      },
      {
        id: '2.7',
        titulo: 'Derivadas de funciones exponenciales y logarítmicas',
        descripcion: 'Incluye la función especial e^x cuya derivada es ella misma.',
        contenido: `
## Introducción

Incluye la [función](/saberes-previos#funciones) especial $e^x$ cuya [derivada](/calculo1/derivadas/2.1) es ella misma.

## Exponencial natural

$$\\frac{d}{dx}(e^x) = e^x$$

## Exponencial general

$$\\frac{d}{dx}(a^x) = a^x \\cdot \\ln(a)$$

## Logaritmo natural

$$\\frac{d}{dx}(\\ln x) = \\frac{1}{x}$$

## Ejemplo

$$f(x) = e^x + \\ln x \\implies f'(x) = e^x + \\frac{1}{x}$$

## Aplicación
- [Interés compuesto](/calculo1/limites/1.8)
- Crecimiento bacteriano
- Decaimiento radiactivo
        `
      },
      {
        id: '2.8',
        titulo: 'Derivación implícita',
        descripcion: 'Se usa cuando y no está despejada explícitamente en términos de x.',
        contenido: `
## Introducción

Se usa cuando $y$ no está despejada explícitamente en términos de $x$.

## Ejemplo

$$x^2 + y^2 = 25$$

Derivando implícitamente:
$$2x + 2y \\cdot \\frac{dy}{dx} = 0$$

Despejando:
$$\\frac{dy}{dx} = -\\frac{x}{y}$$

## Aplicación
Circunferencias, elipses, geometría analítica.
        `
      },
      {
        id: '2.9',
        titulo: 'Derivadas de orden superior',
        descripcion: 'Son derivadas sucesivas: primera (velocidad), segunda (aceleración), tercera (jerk).',
        contenido: `
## Introducción

Son [derivadas](/calculo1/derivadas/2.1) sucesivas que dan información sobre el comportamiento de la [función](/saberes-previos#funciones).

## Jerarquía

### Primera derivada: Velocidad
$$f'(x)$$

### Segunda derivada: Aceleración
$$f''(x)$$

### Tercera derivada: Cambio de aceleración
$$f'''(x)$$

## Ejemplo

$$f(x) = x^4$$
$$f'(x) = 4x^3$$
$$f''(x) = 12x^2$$
$$f'''(x) = 24x$$

## Aplicación
- Movimiento
- [Curvatura](/calculo1/aplicaciones/3.4)
- [Optimización](/calculo1/aplicaciones/3.6)
        `
      },
      {
        id: '2.10',
        titulo: 'Diferenciales',
        descripcion: 'Permiten aproximar pequeños cambios en una función usando su derivada.',
        contenido: `
## Introducción

El diferencial permite aproximar pequeños cambios en una [función](/saberes-previos#funciones) usando su [derivada](/calculo1/derivadas/2.1).

## Fórmula

$$dy = f'(x) \\cdot dx$$

## Ejemplo práctico

$$y = x^2$$

Si $x = 4$, $dx = 0.1$:
$$dy = 2(4)(0.1) = 0.8$$

**Aproximación:** Cuando $x$ pasa de 4 a 4.1, $y$ aumenta aproximadamente 0.8.

## Aplicación real
- [Estimación de errores](/calculo1/aplicaciones/3.10)
- Ingeniería
- Mediciones científicas
        `
      }
    ]
  },
  {
    id: 'aplicaciones',
    titulo: 'Aplicaciones de la Derivada',
    descripcion: 'Herramientas para resolver problemas reales de optimización, movimiento, economía e ingeniería usando derivadas.',
    icono: '⚡',
    color: '#059669',
    temas: [
      {
        id: '3.1',
        titulo: 'Razones de cambio relacionadas',
        descripcion: 'Estudian situaciones donde dos o más variables cambian con respecto al tiempo y están conectadas.',
        contenido: `
## Introducción

Las razones de cambio relacionadas estudian situaciones donde dos o más [variables](/saberes-previos#variables) cambian con respecto al tiempo y están conectadas por una [ecuación](/saberes-previos#ecuaciones).

## Procedimiento general

1. Identificar [variables](/saberes-previos#variables).
2. Relacionarlas mediante una [ecuación](/saberes-previos#ecuaciones).
3. [Derivar](/calculo1/derivadas/2.1) implícitamente respecto al tiempo.
4. Sustituir valores.

## Ejemplo práctico: Globo inflándose

Volumen de una esfera:
$$V = \\frac{4}{3}\\pi r^3$$

[Derivando](/calculo1/derivadas/2.1):
$$\\frac{dV}{dt} = 4\\pi r^2 \\cdot \\frac{dr}{dt}$$

Si aumenta el volumen, también cambia el radio.

## Aplicaciones reales
- Tanques llenándose
- Escaleras deslizándose
- Movimiento circular
- Ingeniería hidráulica
        `
      },
      {
        id: '3.2',
        titulo: 'Crecimiento y decrecimiento de funciones',
        descripcion: 'La primera derivada permite determinar si una función aumenta o disminuye.',
        contenido: `
## Introducción

La primera [derivada](/calculo1/derivadas/2.1) permite determinar si una [función](/saberes-previos#funciones) aumenta o disminuye.

## Criterios

- Si $f'(x) > 0$ → La [función](/saberes-previos#funciones) **crece**.
- Si $f'(x) < 0$ → La [función](/saberes-previos#funciones) **decrece**.

## Ejemplo

$$f(x) = x^2 - 4x$$
$$f'(x) = 2x - 4$$

**Punto crítico:** $2x - 4 = 0 \\implies x = 2$

**Intervalos:**
- $x < 2$: decrece
- $x > 2$: crece

## Aplicación
- Producción empresarial
- Temperatura
- Rendimiento
        `
      },
      {
        id: '3.3',
        titulo: 'Máximos y mínimos relativos',
        descripcion: 'Son puntos donde la función alcanza valores mayores o menores respecto a puntos cercanos.',
        contenido: `
## Introducción

Son puntos donde la [función](/saberes-previos#funciones) alcanza valores mayores o menores respecto a puntos cercanos.

## Criterio de la primera [derivada](/calculo1/derivadas/2.1)

1. Hallar $f'(x) = 0$
2. Analizar cambio de signo.

- $+$ a $-$ → **máximo**
- $-$ a $+$ → **mínimo**

## Ejemplo

$$f(x) = x^2 - 6x + 5$$
$$f'(x) = 2x - 6 \\implies x = 3$$

**Resultado:** Mínimo relativo en $x = 3$.

## Aplicación real
- Ganancia máxima
- Costos mínimos
- Diseño eficiente
        `
      },
      {
        id: '3.4',
        titulo: 'Concavidad y puntos de inflexión',
        descripcion: 'La segunda derivada indica cómo se curva la gráfica de una función.',
        contenido: `
## Introducción

La segunda [derivada](/calculo1/derivadas/2.1) indica cómo se curva la gráfica de una [función](/saberes-previos#funciones).

## Criterios

- Si $f''(x) > 0$ → Cóncava hacia arriba.
- Si $f''(x) < 0$ → Cóncava hacia abajo.

## Punto de inflexión

Ocurre cuando cambia la [concavidad](/calculo1/aplicaciones/3.4).

## Ejemplo

$$f(x) = x^3$$
$$f''(x) = 6x$$

En $x = 0$ cambia de signo.

**Resultado:** Punto de inflexión en $x = 0$.

## Aplicación
Economía, trayectorias, estructuras.
        `
      },
      {
        id: '3.5',
        titulo: 'Criterio de la segunda derivada',
        descripcion: 'Permite clasificar puntos críticos más rápidamente que usando solo la primera derivada.',
        contenido: `
## Introducción

Permite clasificar [puntos críticos](/calculo1/aplicaciones/3.3) más rápidamente que usando solo la primera [derivada](/calculo1/derivadas/2.1).

## Criterio

Si $f'(a) = 0$:

- Si $f''(a) > 0$ → **Mínimo**
- Si $f''(a) < 0$ → **Máximo**

## Ejemplo

$$f(x) = x^2$$
$$f'(x) = 2x$$
$$f''(x) = 2 > 0$$

**Resultado:** Mínimo en $x = 0$.
        `
      },
      {
        id: '3.6',
        titulo: 'Optimización',
        descripcion: 'Busca el mejor valor posible: máxima ganancia, mínimo costo, mayor área, menor material.',
        contenido: `
## Introducción

Busca el mejor valor posible:
- Máxima ganancia
- Mínimo costo
- Mayor área
- Menor material

## Pasos

1. Definir [función](/saberes-previos#funciones) objetivo.
2. [Derivar](/calculo1/derivadas/2.1).
3. Igualar a cero.
4. Evaluar.

## Ejemplo práctico

**Perímetro:** $2x + 2y = 100$

**Área:** $A = xy$

Despejar: $y = 50 - x \\implies A = x(50 - x)$

[Derivar](/calculo1/derivadas/2.1): $A' = 50 - 2x \\implies x = 25$

**Resultado:** Área máxima con cuadrado.

## Aplicación
Arquitectura, economía, logística.
        `
      },
      {
        id: '3.7',
        titulo: 'Teorema de Rolle',
        descripcion: 'Si una función continua en [a,b] cumple f(a)=f(b), existe un punto con tangente horizontal.',
        contenido: `
## Introducción

Si una [función](/saberes-previos#funciones) continua en $[a,b]$ cumple $f(a) = f(b)$, existe un punto con [tangente](/calculo1/derivadas/2.2) horizontal.

## Condiciones

Si una [función](/saberes-previos#funciones):
1. Es continua en $[a,b]$
2. Es [derivable](/calculo1/derivadas/2.1) en $(a,b)$
3. $f(a) = f(b)$

Entonces existe un punto $c$ tal que $f'(c) = 0$.

## Interpretación geométrica

Hay al menos una [tangente](/calculo1/derivadas/2.2) horizontal.

## Ejemplo

$$f(x) = x^2 - 4x + 3 \\text{ en } [1, 3]$$

## Aplicación
Control de trayectorias.
        `
      },
      {
        id: '3.8',
        titulo: 'Teorema del Valor Medio',
        descripcion: 'Existe un punto donde la pendiente instantánea iguala la pendiente promedio.',
        contenido: `
## Introducción

Existe un punto donde la [pendiente instantánea](/calculo1/derivadas/2.2) iguala la pendiente promedio.

## Fórmula

$$f'(c) = \\frac{f(b) - f(a)}{b - a}$$

## Ejemplo físico

Si recorres 100 km en 2 horas, en algún momento tu [velocidad](/calculo1/derivadas/2.2) fue exactamente 50 km/h.

## Aplicación
- Tránsito
- Producción
- Física
        `
      },
      {
        id: '3.9',
        titulo: "Regla de L'Hôpital",
        descripcion: 'Se usa para límites indeterminados del tipo 0/0 o ∞/∞.',
        contenido: `
## Introducción

Se usa para [límites](/calculo1/limites/1.1) indeterminados del tipo $\\frac{0}{0}$ o $\\frac{\\infty}{\\infty}$.

## Fórmula

$$\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\lim_{x \\to a} \\frac{f'(x)}{g'(x)}$$

## Ejemplo

$$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = \\lim_{x \\to 0} \\frac{\\cos(x)}{1} = 1$$

## Aplicación
Modelos avanzados.
        `
      },
      {
        id: '3.10',
        titulo: 'Aproximación lineal y diferencial',
        descripcion: 'Permite aproximar valores cercanos usando la recta tangente.',
        contenido: `
## Introducción

Permite aproximar valores cercanos usando la [recta tangente](/calculo1/derivadas/2.2).

## Fórmula

$$L(x) = f(a) + f'(a)(x - a)$$

## Ejemplo

$$\\sqrt{4.1}$$

Sea $f(x) = \\sqrt{x}$, aproximando desde $x = 4$.

## Aplicación
Cálculos rápidos.
        `
      },
      {
        id: '3.11',
        titulo: 'Análisis completo de funciones',
        descripcion: 'Estudio integral: dominio, intersecciones, límites, continuidad, asíntotas, crecimiento, extremos, concavidad y gráfica.',
        contenido: `
## Introducción

Estudio integral de una [función](/saberes-previos#funciones):
- [Dominio](/saberes-previos#dominio)
- Intersecciones
- [Límites](/calculo1/limites/1.1)
- [Continuidad](/calculo1/limites/1.7)
- [Asíntotas](/calculo1/limites/1.5)
- [Crecimiento](/calculo1/aplicaciones/3.2)
- [Extremos](/calculo1/aplicaciones/3.3)
- [Concavidad](/calculo1/aplicaciones/3.4)
- Gráfica

## Objetivo

Comprender completamente su comportamiento.

## Aplicación
Modelado matemático, ingeniería, economía.
        `
      },
      {
        id: '3.12',
        titulo: 'Aplicaciones en economía, física e ingeniería',
        descripcion: 'Costos marginales, velocidad, aceleración, diseño óptimo y resistencia de materiales.',
        contenido: `
## Economía

### [Costo marginal](/calculo1/aplicaciones/3.12)
$$C'(x)$$
Cambio del costo por unidad adicional.

## Física

### [Velocidad](/calculo1/derivadas/2.2)
$$v(t) = s'(t)$$

### Aceleración
$$a(t) = v'(t)$$

## Ingeniería

- Diseño óptimo
- Resistencia de materiales
- Electricidad
- Producción

## Conclusión

La [derivada](/calculo1/derivadas/2.1) no solo calcula pendientes; permite tomar decisiones, optimizar recursos y comprender fenómenos reales.

Derivar es transformar matemáticas en soluciones para el mundo real.
        `
      }
    ]
  }
];

export function getUnidadById(id) {
  return unidades.find(u => u.id === id);
}

export function getTemaById(unidadId, temaId) {
  const unidad = getUnidadById(unidadId);
  if (!unidad) return null;
  return unidad.temas.find(t => t.id === temaId);
}
