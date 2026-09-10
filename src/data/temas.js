// Estructura completa de temas de Cálculo 1 (Corregida y optimizada)
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

## Definición formal

El **límite por la izquierda** de f(x) cuando x se acerca a a se escribe:

$$\\lim_{x \\to a^{-}} f(x) = L$$

y significa que f(x) se acerca a L cuando x se aproxima a a por valores **menores** que a.

El **límite por la derecha** se escribe:

$$\\lim_{x \\to a^{+}} f(x) = M$$

y significa que f(x) se acerca a M cuando x se aproxima a a por valores **mayores** que a.

Para que exista el límite general, ambos laterales deben existir y ser iguales:

$$\\lim_{x \\to a} f(x) \\text{ existe } \\iff \\lim_{x \\to a^{-}} f(x) = \\lim_{x \\to a^{+}} f(x)$$

---

## Ejercicio 1: Explicación paso a paso

Considere la función definida por partes:

$$f(x) = \\begin{cases} x + 1, & \\text{si } x < 2 \\\\ 2x + 3, & \\text{si } x > 2 \\end{cases}$$

**Paso 1:** Calculamos el límite por la izquierda. La función sigue la recta $y = x + 1$.

$$\\lim_{x \\to 2^{-}} f(x) = \\lim_{x \\to 2^{-}} (x + 1) = 2 + 1 = 3$$

**Paso 2:** Calculamos el límite por la derecha. La función sigue la recta $y = 2x + 3$.

$$\\lim_{x \\to 2^{+}} f(x) = \\lim_{x \\to 2^{+}} (2x + 3) = 2(2) + 3 = 7$$

**Paso 3:** Observamos la gráfica y la tabla de aproximación. La rama izquierda (azul)
llega a 3, la rama derecha (roja) arranca en 7, y la diferencia se mantiene en 4 por
muy cerca que nos acerquemos.

[[tabla-limite expr=x < 2 ? x + 1 : 2*x + 3 punto=2 modo=laterales visual=estatico]]

**Paso 4:** Como los laterales son distintos, el límite general no existe.

$$\\lim_{x \\to 2^{-}} f(x) = 3 \\qquad \\lim_{x \\to 2^{+}} f(x) = 7 \\qquad \\implies \\qquad \\lim_{x \\to 2} f(x) \\text{ no existe}$$

Esta ruptura se llama **discontinuidad de salto**. Los círculos huecos en la gráfica
indican que la función no toma esos valores viniendo del otro lado.

---

## Ejercicio 2: Ahora tú practicas

Aplica el mismo procedimiento a esta función:

$$g(x) = \\begin{cases} x^2 - 1, & \\text{si } x < 1 \\\\ 2x + 1, & \\text{si } x > 1 \\end{cases}$$

Antes de ver la solución, intenta calcular:
- ¿Cuánto vale $\\lim_{x \\to 1^{-}} g(x)$?
- ¿Cuánto vale $\\lim_{x \\to 1^{+}} g(x)$?
- ¿Existe el límite general?

Cuando estés listo, pulsa **Resolver** para verificar tu respuesta paso a paso:

[[tabla-limite expr=x < 1 ? x^2 - 1 : 2*x + 1 punto=1 modo=laterales]]

---

## Resumen

Para que exista el límite en un punto hacen falta **dos condiciones**:
1. Que exista el límite por la izquierda.
2. Que exista el límite por la derecha.
3. **Y** que ambos valgan **exactamente lo mismo**.

Si los laterales difieren, el límite general **no existe** y la función presenta una
discontinuidad de salto en ese punto.

Es distinta de la discontinuidad removible del [tema anterior](/calculo1/limites/1.1):
allí el límite sí existía y solo faltaba el valor en el punto.
        `
      },
      {
        id: '1.3',
        titulo: 'Propiedades de los límites de funciones',
        descripcion: 'Las leyes de los límites permiten calcular el límite de sumas, restas, productos, cocientes, potencias y raíces sin analizar la función desde cero, siempre que los límites de las partes existan.',
        contenido: `
## Introducción

Si conocemos los límites de dos [funciones](/saberes-previos#funciones) en un punto, podemos calcular el límite de combinaciones de esas funciones (sumas, restas, productos, cocientes, potencias, raíces) sin volver a analizar el comportamiento cerca del punto desde cero. A este conjunto de reglas se le llama las leyes de los límites.

Estas leyes solo son válidas cuando los límites individuales de $f$ y $g$ existen. Si alguno no existe, la ley correspondiente no se puede aplicar directamente y hay que recurrir a otras herramientas (factorización, racionalización, límites laterales).

## Leyes de los límites

Sean $\\lim_{x \\to a} f(x) = L$, $\\lim_{x \\to a} g(x) = M$ (ambos existen), $c$ una constante y $n$ un entero positivo.

### 1. Límite de una constante
$$\\lim_{x \\to a} c = c$$

### 2. Límite de la función identidad
$$\\lim_{x \\to a} x = a$$

### 3. Múltiplo constante
$$\\lim_{x \\to a} [c \\cdot f(x)] = c \\cdot L$$

### 4. Suma
$$\\lim_{x \\to a} [f(x) + g(x)] = L + M$$

### 5. Resta
$$\\lim_{x \\to a} [f(x) - g(x)] = L - M$$

### 6. Producto
$$\\lim_{x \\to a} [f(x) \\cdot g(x)] = L \\cdot M$$

### 7. Cociente
$$\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\frac{L}{M}, \\quad \\text{si } M \\neq 0$$

### 8. Potencia
$$\\lim_{x \\to a} [f(x)]^n = L^n$$

### 9. Raíz (potencia fraccionaria)
$$\\lim_{x \\to a} [f(x)]^{1/n} = L^{1/n}$$

Si $n$ es par, esta ley exige además que $L \\geq 0$, porque la raíz par de un número negativo no es un número real.

---

## Ejemplos resueltos

### Ejemplo 1: suma, resta, múltiplo constante y potencia

Calcular $\\lim_{x \\to 2} (x^3 + 4x - 1)$.

Separando la suma y la resta (leyes 4 y 5):
$$\\lim_{x \\to 2} x^3 + \\lim_{x \\to 2} 4x - \\lim_{x \\to 2} 1$$

Cada término se calcula por separado:
- $\\lim_{x \\to 2} x^3 = 2^3 = 8$, por la ley de la potencia.
- $\\lim_{x \\to 2} 4x = 4 \\cdot 2 = 8$, por el múltiplo constante.
- $\\lim_{x \\to 2} 1 = 1$, por el límite de una constante.

Sumando los tres resultados:
$$8 + 8 - 1 = 15$$

### Ejemplo 2: potencia y coeficientes

Calcular $\\lim_{x \\to 3} (2x^2 - 5x + 1)$.

$$\\lim_{x \\to 3} 2x^2 - \\lim_{x \\to 3} 5x + \\lim_{x \\to 3} 1 = 2(3^2) - 5(3) + 1 = 18 - 15 + 1 = 4$$

### Ejemplo 3: cociente

Calcular $\\lim_{x \\to 1} \\frac{x^2 + 3}{x - 4}$.

Antes de dividir hay que confirmar que el límite del denominador no sea cero:
$$\\lim_{x \\to 1} (x - 4) = 1 - 4 = -3 \\neq 0$$

Como el denominador no tiende a cero, la ley del cociente aplica directamente:
$$\\lim_{x \\to 1} \\frac{x^2 + 3}{x - 4} = \\frac{1^2 + 3}{1 - 4} = \\frac{4}{-3} = -\\frac{4}{3}$$

### Ejemplo 4: producto

Calcular $\\lim_{x \\to 2} (x + 1)(x^2 - 3)$.

Se calcula el límite de cada factor por separado:
$$\\lim_{x \\to 2} (x + 1) = 3 \\qquad \\lim_{x \\to 2} (x^2 - 3) = 1$$

Y se multiplican los resultados:
$$3 \\cdot 1 = 3$$

### Ejemplo 5: raíz (potencia fraccionaria)

Calcular $\\lim_{x \\to 9} (x + 7)^{1/2}$.

Primero se resuelve el interior:
$$\\lim_{x \\to 9} (x + 7) = 16$$

Como $16 \\geq 0$, la ley de la raíz aplica:
$$16^{1/2} = 4$$

## Cuándo no se pueden aplicar directamente

Las leyes de los límites solo garantizan un resultado cuando cada límite involucrado existe y, en el cociente, el límite del denominador no es cero. Cuando la sustitución directa produce una forma como $\\frac{0}{0}$, la ley del cociente todavía no se puede usar: primero hay que simplificar la expresión, factorizando o racionalizando, como se hizo en [Introducción a los límites](/calculo1/limites/1.1), y solo después aplicar las propiedades sobre la expresión ya simplificada.
        `
      },
      {
        id: '1.4',
        titulo: 'Límites al infinito y en infinito',
        descripcion: 'Analizan el comportamiento extremo de una función cuando x crece o decrece sin límite, incluyendo ejercicios y definición formal.',
        contenido: `
## Definición Formal

El límite $\\lim_{x \\to \\infty} f(x) = L$ significa que para todo $\\varepsilon > 0$, existe un número positivo $N$ tal que $|f(x) - L| < \\varepsilon$ siempre que $x > N$. De forma análoga cuando $x \\to -\\infty$.

## Ejercicios Explicados

### 1. Calcular $\\lim_{x \\to -\\infty} \\frac{2x^2 - 5}{3x^2 + x + 2}$
- **Método:** Se divide cada término del numerador y del denominador entre la mayor potencia de $x$ del denominador ($x^2$).
- **Desarrollo:**
  $$\\lim_{x \\to -\\infty} \\frac{\\frac{2x^2}{x^2} - \\frac{5}{x^2}}{\\frac{3x^2}{x^2} + \\frac{x}{x^2} + \\frac{2}{x^2}} = \\lim_{x \\to -\\infty} \\frac{2 - \\frac{5}{x^2}}{3 + \\frac{1}{x} + \\frac{2}{x^2}}$$
- **Evaluación:** Al tender $x$ a $-\\infty$, los términos con fracciones sobre $x$ se anulan ($0$):
  $$\\frac{2 - 0}{3 + 0 + 0} = \\frac{2}{3}$$

### 2. Calcular $\\lim_{x \\to \\infty} \\frac{4x}{x^2 + 9}$
- **Desarrollo:** Dividiendo cada término entre $x^2$:
  $$\\lim_{x \\to \\infty} \\frac{\\frac{4x}{x^2}}{\\frac{x^2}{x^2} + \\frac{9}{x^2}} = \\lim_{x \\to \\infty} \\frac{\\frac{4}{x}}{1 + \\frac{9}{x^2}} = \\frac{0}{1} = 0$$

## Cómo hacer la gráfica
- Dibuja un plano cartesiano con los ejes $X$ e $Y$.
- Traza una línea punteada horizontal en $y = L$ (asíntota horizontal).
- Dibuja una curva suave que, al extenderse hacia los extremos del eje $X$ ($+\\infty$ o $-\\infty$), se aproxime cada vez más a esa línea punteada sin llegar a cruzarla o tocarla necesariamente.
        `
      },
      {
        id: '1.5',
        titulo: 'Asíntotas verticales, horizontales y oblicuas',
        descripcion: 'Rectas a las que una función se aproxima cada vez más sin nunca tocarlas.',
        contenido: `
## Definición

Sea $f$ una función. Se dice que $f$ tiene **asíntotas** si se cumple alguna de estas tres
situaciones. Una asíntota es una recta a la que la curva se acerca tanto como queramos sin
llegar a tocarla.

## 1. Asíntota horizontal

Si el límite en el infinito es un número:

$$\\lim_{x \\to \\infty} f(x) = k \\qquad o \\qquad \\lim_{x \\to -\\infty} f(x) = k$$

entonces la recta $y = k$ es una asíntota horizontal de $f$.

## 2. Asíntota vertical

Si al acercarse a un punto la función se dispara:

$$\\lim_{x \\to a} f(x) = \\pm\\infty$$

entonces la recta $x = a$ es una asíntota vertical. En las funciones racionales, esos puntos
$a$ son justamente los que **no** pertenecen al dominio: los que anulan el denominador.

## 3. Asíntota oblicua

La recta $y = mx + b$, con $m \\neq 0$, es una asíntota oblicua si

$$\\lim_{x \\to \\pm\\infty} \\left[ f(x) - (mx + b) \\right] = 0$$

donde los dos coeficientes se calculan con estos límites:

$$m = \\lim_{x \\to \\pm\\infty} \\frac{f(x)}{x} \\qquad b = \\lim_{x \\to \\pm\\infty} \\left[ f(x) - mx \\right]$$

**Cuándo buscarla:** solo hay asíntota oblicua si el grado del numerador es exactamente uno
mayor que el del denominador. Y se busca únicamente si **no** hay asíntota horizontal: las dos
son excluyentes.

## Ejemplo 1: hay oblicua, no horizontal

El numerador es de grado 2 y el denominador de grado 1, así que esperamos oblicua.

[[asintotas expr=(x^2+2)/(x-2)]]

## Ejemplo 2: hay horizontal, no oblicua

Aquí numerador y denominador son del mismo grado. El límite en el infinito es el cociente de
los coeficientes principales, y al haber horizontal ya no puede haber oblicua.

[[asintotas expr=(2x^2+3)/(x^2-1)]]

## Ejemplo 3: dos verticales y una horizontal

El denominador se anula en dos puntos, así que aparecen dos asíntotas verticales, una a cada
lado del eje.

[[asintotas expr=2x^2/(9-x^2)]]

## Resumen

- **Horizontal:** se mira el límite cuando $x \\to \\pm\\infty$. Si da un número, esa es la altura.
- **Vertical:** se miran los puntos fuera del dominio. Si el límite ahí se dispara, hay asíntota.
- **Oblicua:** solo si no hay horizontal y el numerador supera al denominador en exactamente un grado.
        `
      },
      {
        id: '1.6',
        titulo: 'Límites trigonométricos',
        descripcion: 'Límites fundamentales y ejemplos prácticos explicados paso a paso para evitar indeterminaciones.',
        contenido: `
## Teorema: Límites Fundamentales

Los límites trigonométricos se resuelven utilizando identidades y un grupo de teoremas clave que sirven como herramientas para evitar indeterminaciones del tipo $\\frac{0}{0}$.

1. $\\lim_{x \\to 0} \\operatorname{sen}(x) = 0$
2. $\\lim_{x \\to 0} \\cos(x) = 1$
3. $\\lim_{x \\to 0} \\frac{\\operatorname{sen}(x)}{x} = 1$
4. $\\lim_{x \\to 0} \\frac{1 - \\cos(x)}{x} = 0$

---

## Ejemplos Prácticos a Calcular

### Ejemplo 1: Calcular $\\lim_{x \\to 0} \\frac{\\operatorname{sen}(5x)}{2x}$

1. **Identifica el problema:** Si evalúas directo, obtienes una indeterminación $\\frac{0}{0}$.
2. **Iguala el argumento:** Para usar el límite especial ($\\frac{\\operatorname{sen}(\\theta)}{\\theta} = 1$ cuando $\\theta \\to 0$), el ángulo del seno y el denominador deben ser iguales. Aquí tienes $5x$ arriba y $2x$ abajo.
3. **Ajusta las constantes:** Saca el número que sobra del denominador y multiplica y divide por $5$:
   $$\\frac{1}{2} \\lim_{x \\to 0} \\frac{\\operatorname{sen}(5x)}{x} = \\frac{5}{2} \\lim_{x \\to 0} \\frac{\\operatorname{sen}(5x)}{5x}$$
4. **Resultado:** Como $\\lim_{x \\to 0} \\frac{\\operatorname{sen}(5x)}{5x} = 1$, te queda:
   $$\\frac{5}{2} \\cdot 1 = \\frac{5}{2}$$

---

### Ejemplo 2: Calcular $\\lim_{t \\to 0} \\frac{\\tan(t)}{2t}$

1. **Usa identidades:** La tangente se puede expresar como $\\tan(t) = \\frac{\\operatorname{sen}(t)}{\\cos(t)}$. Sustitúyela en el límite:
   $$\\lim_{t \\to 0} \\frac{\\frac{\\operatorname{sen}(t)}{\\cos(t)}}{2t} = \\lim_{t \\to 0} \\frac{\\operatorname{sen}(t)}{2t \\cos(t)}$$
2. **Separa los términos:** Agrupa la parte del límite especial y deja el coseno por separado:
   $$\\frac{1}{2} \\lim_{t \\to 0} \\left( \\frac{\\operatorname{sen}(t)}{t} \\cdot \\frac{1}{\\cos(t)} \\right)$$
3. **Evalúa cada parte:**
   - $\\lim_{t \\to 0} \\frac{\\operatorname{sen}(t)}{t} = 1$
   - $\\lim_{t \\to 0} \\frac{1}{\\cos(t)} = \\frac{1}{\\cos(0)} = \\frac{1}{1} = 1$
4. **Resultado:**
   $$\\frac{1}{2} \\cdot 1 \\cdot 1 = \\frac{1}{2}$$

## Aplicación en derivadas
Estos [límites](/calculo1/limites/1.1) son esenciales para demostrar las [fórmulas de derivación](/calculo1/derivadas/2.6):
- $\\frac{d}{dx}\\sin(x) = \\cos(x)$
- $\\frac{d}{dx}\\cos(x) = -\\sin(x)$
        `
      },
      {
        id: '1.7',
        titulo: 'Continuidad',
        descripcion: 'Condición de continuidad en un punto: el límite debe coincidir con el valor de la función.',
        contenido: `
## Introducción

Una [función](/saberes-previos#funciones) es continua en un número $a$ si no tiene interrupciones, saltos o agujeros. 

## Definición formal

Una función $f$ es continua en $x = a$ si se satisfacen tres condiciones obligatorias:
1. $f(a)$ está definida (el punto existe en el intervalo).
2. El límite $\\lim_{x \\to a} f(x)$ existe.
3. El límite coincide con la función: $\\lim_{x \\to a} f(x) = f(a)$.

## Ejemplo de la gráfica: $f(x) = \\frac{1}{x - 2}$
- Su dominio es $\\mathbb{R} - \\{2\\}$ porque en $x = 2$ el denominador se anula.
- En $x = 2$ la función **no está definida** ($f(2)$ no existe), por lo que no es continua en ese punto.

## Cómo hacer la gráfica
- Dibuja una línea punteada vertical en $x = 2$ para representar la asíntota vertical.
- Traza las dos ramas de la curva que se disparan hacia los infinitos a ambos lados de la asíntota.
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
        titulo: 'Discontinuidad esencial y discontinuidad evitable (removible)',
        descripcion: 'No todas las discontinuidades son iguales: unas se pueden "reparar" rellenando un punto y otras no. Clasificación completa con ejercicios resueltos de tus notas de clase.',
        contenido: `
## Introducción

En [Continuidad](/calculo1/limites/1.7) vimos que $f$ es continua en $a$ si se cumplen a la vez tres condiciones: $f(a)$ existe, el [límite](/calculo1/limites/1.1) existe, y ambos coinciden. Si al menos una de esas tres falla, la función es discontinua en $a$.

Pero no todas las discontinuidades se comportan igual. La pregunta que las separa en dos grandes familias es siempre la misma:

> **¿Existe el límite en ese punto o no existe?**

## Familia 1: Discontinuidad esencial (no removible)

Aquí el límite $\\lim_{x \\to a} f(x)$ **no existe**. Como la función no se acerca a un único valor, no hay ningún número que le podamos asignar a $f(a)$ para "arreglar" la gráfica. Por eso a esta familia se le llama **esencial** (o **no removible**): el problema no tiene solución posible.

Existen dos formas de que el límite no exista, y corresponden a sus dos subtipos:

### a) Discontinuidad de salto
Los dos [límites laterales](/calculo1/limites/1.2) existen (son números finitos), pero son **distintos** entre sí:

$$\\lim_{x \\to a^{-}} f(x) \\neq \\lim_{x \\to a^{+}} f(x)$$

**Cómo se ve en la gráfica:** una rama de la curva llega hasta cierta altura y se detiene en un círculo hueco; la otra rama arranca desde una altura distinta, también con un círculo hueco. Entre ambas queda un "escalón" vertical justo en $x = a$. Ya trabajamos un ejemplo completo de este caso en [Límites laterales](/calculo1/limites/1.2).

[[grafica tipo=salto]]

### b) Discontinuidad infinita
Al menos uno de los límites laterales se dispara a $+\\infty$ o a $-\\infty$:

$$\\lim_{x \\to a^{-}} f(x) = \\pm\\infty \\quad \\text{o bien} \\quad \\lim_{x \\to a^{+}} f(x) = \\pm\\infty$$

**Cómo se ve en la gráfica:** aparece una línea punteada vertical en $x = a$ (la [asíntota vertical](/calculo1/limites/1.5)), y las dos ramas de la curva se acercan cada vez más a esa línea sin tocarla jamás, disparándose hacia arriba o hacia abajo.

[[grafica tipo=infinita]]

**Ejemplo:** $f(x) = \\dfrac{1}{x - 1}$ tiene una discontinuidad infinita en $x = 1$, porque $\\lim_{x \\to 1^{-}} f(x) = -\\infty$ y $\\lim_{x \\to 1^{+}} f(x) = +\\infty$.

## Familia 2: Discontinuidad evitable (removible)

Aquí el límite $\\lim_{x \\to a} f(x)$ **sí existe**, pero pasa una de estas dos cosas:

- $f(a)$ no está definida, **o**
- $f(a)$ sí está definida, pero **no coincide** con el límite: $f(a) \\neq \\lim_{x \\to a} f(x)$

**Cómo se ve en la gráfica:** la curva se comporta perfectamente bien alrededor de $a$, acercándose a una sola altura por ambos lados. Justo en esa altura hay un "hueco" (un círculo vacío), porque ahí la función no está definida; o, en su lugar, hay un punto suelto dibujado en otra altura, que muestra que $f(a)$ existe pero está "mal puesto".

[[grafica tipo=evitable]]

¿Por qué se llama **evitable**? Porque basta con definir (o redefinir) $f(a)$ igual al valor del límite para que la función se vuelva continua en ese punto. De las tres discontinuidades, esta es la única que se repara con un solo retoque.

## Resumen: ¿cómo distinguirlas?

| Tipo | ¿Existe el límite? | ¿Se puede reparar? |
|---|---|---|
| De salto | No — los laterales existen pero son distintos | No |
| Infinita | No — algún lateral es $\\pm\\infty$ | No |
| Evitable (removible) | Sí | Sí, redefiniendo $f(a) = \\lim_{x \\to a} f(x)$ |

Las dos primeras son subtipos de la **discontinuidad esencial**; la tercera es la **discontinuidad evitable**.

---

## Ejercicios Resueltos

### Ejercicio 1: Estudiar la continuidad de $f(x) = \\begin{cases} 2x + 3 & \\text{si } x \\neq 1 \\\\ 2 & \\text{si } x = 1 \\end{cases}$ en $x = 1$
1. **Evaluar en el punto:** $f(1) = 2$.
2. **Calcular el límite:** 
   $$\\lim_{x \\to 1} (2x + 3) = 2(1) + 3 = 5$$
3. **Comparar:** Como $\\lim_{x \\to 1} f(x) \\neq f(1)$ ($5 \\neq 2$), la función **no es continua** en $x = 1$.
4. **Clasificar:** El límite sí existe ($5$), así que es una **discontinuidad evitable (removible)**. Se repara redefiniendo:
   $$f(x) = \\begin{cases} 2x + 3 & \\text{si } x \\neq 1 \\\\ 5 & \\text{si } x = 1 \\end{cases}$$

### Ejercicio 2: Estudiar la continuidad de $f(x) = \\frac{x^{1/2} - 2}{x - 4}$ en $x = 4$
1. **Evaluar en el punto:** $f(4)$ no existe (el denominador se anula y $x = 4$ queda fuera del dominio).
2. **Calcular el límite (racionalizando):**
   $$\\lim_{x \\to 4} \\frac{(x^{1/2} - 2)(x^{1/2} + 2)}{(x - 4)(x^{1/2} + 2)} = \\lim_{x \\to 4} \\frac{x - 4}{(x - 4)(x^{1/2} + 2)}$$
3. **Simplificar y evaluar:**
   $$\\lim_{x \\to 4} \\frac{1}{x^{1/2} + 2} = \\frac{1}{4^{1/2} + 2} = \\frac{1}{4}$$
4. **Clasificar:** El límite existe y vale $\\frac{1}{4}$, pero $f(4)$ no está definida $\\implies$ **discontinuidad evitable** en $x = 4$.
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