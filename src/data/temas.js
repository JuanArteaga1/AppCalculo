// Estructura completa de temas de Cálculo 1 (Corregida y optimizada)
export const unidades = [
  {
    id: 'limites',
    titulo: 'Límites y Continuidad',
    descripcion: '¿Qué sucede cuando nos acercamos cada vez más a un punto? Los límites te permiten descubrir y comprender qué ocurre cerca de un valor determinado, incluso cuando no llegamos exactamente a él. Aquí comienza el camino hacia el cálculo diferencial.',
    icono: '∞',
    color: '#4F46E5',
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
## Definición informal

Se interpreta como: es mirar cuál es el comportamiento de la $f$ cuando su variable independiente ($x$) crece o decrece indefinidamente, o cuando se acerca a un punto.

## Definición formal

Sean $\\lim_{x \\to a} f(x) = L$ y $\\lim_{x \\to a} g(x) = M$, donde ambos límites
existen, $c$ una constante y $n$ un entero positivo. Entonces valen las siguientes leyes.

Estas leyes solo son válidas cuando los límites individuales de $f$ y $g$ existen. Si
alguno no existe, la ley correspondiente no se puede aplicar directamente y hay que
recurrir a otras herramientas (factorización, racionalización, límites laterales).

## Las leyes, una por una

### 1. Límite de una constante
$$\\lim_{x \\to a} c = c$$

Un número que no depende de $x$ no cambia mientras $x$ se mueve: su límite es él mismo.

**Ejemplo:** $\\lim_{x \\to 2} 5 = 5$.

[[grafica-limite expr=5 punto=2]]

### 2. Límite de la función identidad
$$\\lim_{x \\to a} x = a$$

La función $y = x$ hace exactamente lo que hace su variable: si $x$ se acerca a $a$,
el límite es $a$.

**Ejemplo:** $\\lim_{x \\to 2} x = 2$.

[[grafica-limite expr=x punto=2]]

### 3. Múltiplo constante
$$\\lim_{x \\to a} [c \\cdot f(x)] = c \\cdot L$$

La constante que multiplica puede salir del límite: primero se calcula el límite
de $f$ y al final se multiplica por $c$.

**Ejemplo:** $\\lim_{x \\to 2} 4x = 4 \\cdot \\lim_{x \\to 2} x = 4 \\cdot 2 = 8$.

[[grafica-limite expr=4*x punto=2]]

### 4. Suma
$$\\lim_{x \\to a} [f(x) + g(x)] = L + M$$

El límite de la suma es la suma de los límites: se parte la expresión en pedazos
y se calcula cada uno por separado.

**Ejemplo:** $\\lim_{x \\to 2} (x^3 + 4x - 1) = 2^3 + 4(2) - 1 = 8 + 8 - 1 = 15$.

[[grafica-limite expr=x^3+4*x-1 punto=2]]

### 5. Resta
$$\\lim_{x \\to a} [f(x) - g(x)] = L - M$$

Igual que la suma, pero restando: el límite de la diferencia es la diferencia
de los límites.

**Ejemplo:** $\\lim_{x \\to 3} (2x^2 - 5x + 1) = 2(3^2) - 5(3) + 1 = 18 - 15 + 1 = 4$.

[[grafica-limite expr=2*x^2-5*x+1 punto=3]]

### 6. Producto
$$\\lim_{x \\to a} [f(x) \\cdot g(x)] = L \\cdot M$$

Se calcula el límite de cada factor por separado y después se multiplican
los resultados.

**Ejemplo:** $\\lim_{x \\to 2} (x + 1)(x^2 - 3) = 3 \\cdot 1 = 3$, porque
$\\lim_{x \\to 2} (x + 1) = 3$ y $\\lim_{x \\to 2} (x^2 - 3) = 1$.

[[grafica-limite expr=(x+1)*(x^2-3) punto=2]]

### 7. Cociente
$$\\lim_{x \\to a} \\frac{f(x)}{g(x)} = \\frac{L}{M}, \\quad \\text{si } M \\neq 0$$

Se divide el límite de arriba entre el de abajo, pero antes hay que confirmar
que el denominador no tienda a cero.

**Ejemplo:** $\\lim_{x \\to 1} \\frac{x^2 + 3}{x - 4}$. Como
$\\lim_{x \\to 1} (x - 4) = -3 \\neq 0$, la ley aplica:
$$\\frac{1^2 + 3}{1 - 4} = \\frac{4}{-3} = -\\frac{4}{3}$$

[[grafica-limite expr=(x^2+3)/(x-4) punto=1]]

### 8. Potencia
$$\\lim_{x \\to a} [f(x)]^n = L^n$$

Primero se calcula el límite de adentro y después se eleva al exponente.

**Ejemplo:** $\\lim_{x \\to 2} (x^2) = [\\lim_{x \\to 2} x]^2 = 2^2 = 4$.

[[grafica-limite expr=x^2 punto=2]]

### 9. Raíz (potencia fraccionaria)
$$\\lim_{x \\to a} [f(x)]^{1/n} = L^{1/n}$$

Funciona como una potencia con exponente fraccionario: primero el interior,
luego la raíz. Si $n$ es par, esta ley exige además que $L \\geq 0$, porque la
raíz par de un número negativo no es un número real.

**Ejemplo:** $\\lim_{x \\to 9} (x + 7)^{1/2}$. El interior tiende a $16 \\geq 0$,
así que la ley aplica: $16^{1/2} = 4$.

[[grafica-limite expr=sqrt(x+7) punto=9]]

---

## Cuándo no se pueden aplicar directamente

Las leyes de los límites solo garantizan un resultado cuando cada límite involucrado existe y, en el cociente, el límite del denominador no es cero. Cuando la sustitución directa produce una forma como $\\frac{0}{0}$, la ley del cociente todavía no se puede usar: primero hay que simplificar la expresión, factorizando o racionalizando, como se hizo en [Introducción a los límites](/calculo1/limites/1.1), y solo después aplicar las propiedades sobre la expresión ya simplificada.
        `
      },
      {
        id: '1.4',
        titulo: 'Límites al infinito y en infinito',
        descripcion: 'Analizan el comportamiento extremo de una función cuando x crece o decrece sin límite, incluyendo ejercicios y definición formal.',
        contenido: `
## Definición informal

Un límite al infinito describe qué le pasa a $f(x)$ cuando $x$ crece o decrece sin
límite, y un límite infinito describe qué pasa cuando, al acercarnos a un valor de
$x$, los valores de la función crecen o disminuyen sin límite.

Se interpreta como: es mirar cuál es el comportamiento de la $f$ cuando su variable
independiente ($x$) crece o decrece indefinidamente.

## Definición formal

El límite $\\lim_{x \\to \\infty} f(x) = L$ significa que para todo $\\varepsilon > 0$, existe un número positivo $N$ tal que $|f(x) - L| < \\varepsilon$ siempre que $x > N$. De forma análoga cuando $x \\to -\\infty$.

## Gráfica conceptual: cuando $x$ tiende a $+\\infty$

Esta gráfica no corresponde a una función específica (no es $f(x) = x^2$ ni
$f(x) = \\frac{1}{x}$): es una representación conceptual de la definición. La curva
se acerca cada vez más a la recta punteada $y = L$ mientras la flecha avanza hacia
$+\\infty$.

[[grafica-conceptual variante=mas]]

## Gráfica conceptual: cuando $x$ tiende a $-\\infty$

La misma idea hacia el otro extremo: cuando $x$ decrece sin límite, la curva se
pega cada vez más a la recta $y = L$.

[[grafica-conceptual variante=menos]]

## Casos con ejemplos

### Caso 1. Cuando $x$ tiende a $+\\infty$

$$\\lim_{x \\to \\infty} x^2$$

**Resolución.** Se sustituyen valores cada vez más grandes y se mira hacia dónde va el resultado:

| $x$ | $10$ | $100$ | $1\\,000$ | $10\\,000$ |
|---|---|---|---|---|
| $x^2$ | $100$ | $10\\,000$ | $1\\,000\\,000$ | $100\\,000\\,000$ |

Cada vez que $x$ se multiplica por $10$, el resultado se multiplica por $100$. No se acerca a ningún número: crece sin tope.

$$\\lim_{x \\to \\infty} x^2 = \\boxed{+\\infty}$$

### Caso 2. Cuando $x$ tiende a $-\\infty$

$$\\lim_{x \\to -\\infty} x^2$$

**Resolución.** Ahora los valores son negativos, pero el exponente es par y el cuadrado borra el signo:

| $x$ | $-10$ | $-100$ | $-1\\,000$ | $-10\\,000$ |
|---|---|---|---|---|
| $x^2$ | $100$ | $10\\,000$ | $1\\,000\\,000$ | $100\\,000\\,000$ |

Sale exactamente la misma columna que antes, así que el resultado es el mismo:

$$\\lim_{x \\to -\\infty} x^2 = \\boxed{+\\infty}$$

### Caso 3. Cuidado con el exponente impar

$$\\lim_{x \\to -\\infty} x^3$$

**Resolución.** Con exponente impar el signo sí sobrevive: $(-10)^3 = -1\\,000$ y $(-100)^3 = -1\\,000\\,000$. Los valores se hacen cada vez más negativos.

$$\\lim_{x \\to -\\infty} x^3 = \\boxed{-\\infty}$$

La regla corta: en $x^n$ con $n$ par los dos extremos dan $+\\infty$; con $n$ impar cada extremo se va para su lado.

## Ejemplo animado

Vamos a mirar la función $f(x) = \\frac{4x}{x^2 + 9}$ en los dos extremos. Arriba crece como $4x$ y abajo como $x^2$: el denominador es de grado mayor, así que gana y la fracción se hace pequeña.

Se comprueba dividiendo cada término entre $x^2$, la mayor potencia del denominador:

$$\\lim_{x \\to \\infty} \\frac{4x}{x^2 + 9} = \\lim_{x \\to \\infty} \\frac{\\frac{4x}{x^2}}{\\frac{x^2}{x^2} + \\frac{9}{x^2}} = \\lim_{x \\to \\infty} \\frac{\\frac{4}{x}}{1 + \\frac{9}{x^2}} = \\frac{0}{1} = 0$$

Por $-\\infty$ pasa lo mismo, así que la recta $y = 0$ es asíntota horizontal por los dos lados.

Tampoco hay asíntota vertical: $x^2 + 9$ nunca vale cero, porque $x^2 = -9$ no tiene solución real. La función está definida en todos los reales.

Pulsa **Resolver** y fíjate en tres cosas mientras se dibuja:

- La curva **sube hasta un máximo** cerca de $x = 3$, donde vale $\\frac{2}{3}$, y desde ahí empieza a bajar. Alejarse del origen no siempre significa crecer.
- Después se **aplasta contra la recta verde** $y = 0$ sin llegar a tocarla. Eso es la asíntota horizontal: el destino, no un tope.
- En el origen la curva **cruza** esa misma recta, porque $f(0) = 0$. Una asíntota no es una barrera: dice a qué se acerca la función cuando $x$ se va al infinito, no por dónde puede pasar.

[[asintotas expr=4*x/(x^2+9)]]

Abajo, cada paso del procedimiento aparece con el color de su recta en la gráfica, para que se vea de cuál está hablando.

## Límites de solución directa

No todo límite al infinito es una indeterminación. Cuando el comportamiento se decide solo con el término de mayor grado, el resultado se lee directamente y no hay nada que levantar.

Ejemplo: $$\\lim_{x \\to \\infty} (-x^2 + 3x + 5)$$

Al crecer $x$, el término de mayor grado manda sobre los demás: $3x$ y $5$ crecen, pero $-x^2$ crece mucho más rápido y con signo negativo. Basta mirarlo a él.

$$-x^2 \\rightarrow -\\infty$$

$$\\boxed{-\\infty}$$

**Esto no es una indeterminación.** No hay un $\\frac{\\infty}{\\infty}$ ni un $\\infty - \\infty$ que resolver: la respuesta sale de comparar los grados.

## B) Indeterminación $\\frac{\\infty}{\\infty}$

$$\\boxed{\\frac{\\infty}{\\infty}}$$

Aparece en las funciones racionales, donde el numerador y el denominador crecen los dos sin límite:

$$\\lim_{x \\to \\infty} \\frac{P(x)}{Q(x)}$$

Decir que el resultado es "infinito entre infinito" no dice nada: hay que comparar a qué velocidad crece cada uno. Eso lo deciden sus grados.

### Mismo grado: el cociente de los coeficientes

Cuando $P$ y $Q$ tienen el mismo grado, los dos crecen igual de rápido y el límite es el cociente de los coeficientes de mayor grado.

:::desplegable Ejemplo resuelto: $\\lim_{x \\to \\infty} \\frac{5x^3 - 2x + 1}{2x^3 + 7x^2}$

Los dos son de grado 3. Se divide cada término entre $x^3$, la mayor potencia del denominador:

$$\\lim_{x \\to \\infty} \\frac{\\frac{5x^3}{x^3} - \\frac{2x}{x^3} + \\frac{1}{x^3}}{\\frac{2x^3}{x^3} + \\frac{7x^2}{x^3}} = \\lim_{x \\to \\infty} \\frac{5 - \\frac{2}{x^2} + \\frac{1}{x^3}}{2 + \\frac{7}{x}}$$

Todas las fracciones con $x$ en el denominador se van a cero:

$$\\frac{5 - 0 + 0}{2 + 0} = \\boxed{\\frac{5}{2}}$$

Que es justo el cociente de los coeficientes de mayor grado: $5$ entre $2$.
:::

### Numerador de menor grado: el límite es 0

Si el numerador es de grado menor, el denominador crece más rápido y la fracción se achica sin parar.

:::desplegable Ejemplo resuelto: $\\lim_{x \\to \\infty} \\frac{3x + 4}{x^2 - 1}$

Grado 1 arriba, grado 2 abajo. Se divide todo entre $x^2$:

$$\\lim_{x \\to \\infty} \\frac{\\frac{3x}{x^2} + \\frac{4}{x^2}}{\\frac{x^2}{x^2} - \\frac{1}{x^2}} = \\lim_{x \\to \\infty} \\frac{\\frac{3}{x} + \\frac{4}{x^2}}{1 - \\frac{1}{x^2}} = \\frac{0 + 0}{1 - 0} = \\boxed{0}$$
:::

## C) Indeterminación $\\infty - \\infty$

$$\\boxed{\\infty - \\infty}$$

Aparece cuando dos cantidades crecen sin límite y una se le resta a la otra. No se puede decir que da cero: depende de cuál crece más rápido y de cuánto se separan.

Cuando hay una raíz de por medio, se resuelve **multiplicando y dividiendo por el conjugado**. Así la resta se convierte en una diferencia de cuadrados, la raíz desaparece del numerador y queda una fracción que ya se puede tratar.

:::desplegable Ejemplo resuelto paso a paso

$$\\lim_{x \\to \\infty} \\left( \\sqrt{x^2 + 3x} - x \\right)$$

**1. Reconocer la indeterminación.** La raíz crece y $x$ también, así que es $\\infty - \\infty$: no se puede decir que dé cero.

**2. Multiplicar por el conjugado.** El conjugado es la misma expresión con el signo del medio cambiado. Se multiplica y se divide por él, que es como multiplicar por 1:

$$\\left( \\sqrt{x^2 + 3x} - x \\right) \\cdot \\frac{\\sqrt{x^2 + 3x} + x}{\\sqrt{x^2 + 3x} + x}$$

**3. La raíz desaparece.** Arriba queda $(a-b)(a+b) = a^2 - b^2$, y el cuadrado deshace la raíz:

$$\\frac{(x^2 + 3x) - x^2}{\\sqrt{x^2 + 3x} + x} = \\frac{3x}{\\sqrt{x^2 + 3x} + x}$$

**4. Ahora es un $\\frac{\\infty}{\\infty}$.** Se divide arriba y abajo entre $x$. Dentro de la raíz eso significa dividir entre $x^2$:

$$\\frac{3}{\\sqrt{1 + \\frac{3}{x}} + 1}$$

**5. Evaluar.** Cuando $x \\to \\infty$, la fracción $\\frac{3}{x}$ se va a cero:

$$\\frac{3}{\\sqrt{1} + 1} = \\boxed{\\frac{3}{2}}$$
:::

## Límites infinitos: cuando la función se dispara en $x = a$

Un límite infinito describe que, al acercarnos a un valor de $x$, los valores de la función crecen o disminuyen sin límite. Ojo con la diferencia: en un límite al infinito es $x$ la que crece; aquí la que se dispara es $f(x)$.

$$\\lim_{x \\to a} f(x) = +\\infty$$

La curva crece hacia $+\\infty$ cuando $x$ se aproxima a $a$: dentro del intervalo $(a-\\delta, a+\\delta)$ ya superó cualquier cota $y = M$ que se nos ocurra poner, por alta que sea.

[[grafica-infinito variante=mas]]

$$\\lim_{x \\to a} f(x) = -\\infty$$

El caso simétrico: la curva decrece hacia $-\\infty$ y cae por debajo de la cota $-M$.

[[grafica-infinito variante=menos]]

:::desplegable Ejemplo: $\\lim_{x \\to a} f(x) = +\\infty$

Cuando $x$ se acerca a $a$, $f(x)$ se hace cada vez más grande, sin máximo. No importa qué número enorme elijamos: la curva termina pasándolo y sigue subiendo.

Dicho de otro modo, el límite no existe como número; lo que decimos al escribir $+\\infty$ es *cómo* no existe: la función no se queda cerca de ningún valor, se escapa hacia arriba.

[[grafica-infinito variante=mas]]
:::

## Ejercicios explicados: el método de dividir

### 1. Calcular $\\lim_{x \\to -\\infty} \\frac{2x^2 - 5}{3x^2 + x + 2}$
- **Método:** Se divide cada término del numerador y del denominador entre la mayor potencia de $x$ del denominador ($x^2$).
- **Desarrollo:**
  $$\\lim_{x \\to -\\infty} \\frac{\\frac{2x^2}{x^2} - \\frac{5}{x^2}}{\\frac{3x^2}{x^2} + \\frac{x}{x^2} + \\frac{2}{x^2}} = \\lim_{x \\to -\\infty} \\frac{2 - \\frac{5}{x^2}}{3 + \\frac{1}{x} + \\frac{2}{x^2}}$$
- **Evaluación:** Al tender $x$ a $-\\infty$, los términos con fracciones sobre $x$ se anulan ($0$):
  $$\\frac{2 - 0}{3 + 0 + 0} = \\frac{2}{3}$$

### 2. Calcular $\\lim_{x \\to \\infty} \\frac{4x}{x^2 + 9}$
- **Desarrollo:** Dividiendo cada término entre $x^2$:
  $$\\lim_{x \\to \\infty} \\frac{\\frac{4x}{x^2}}{\\frac{x^2}{x^2} + \\frac{9}{x^2}} = \\lim_{x \\to \\infty} \\frac{\\frac{4}{x}}{1 + \\frac{9}{x^2}} = \\frac{0}{1} = 0$$
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

[[grafica-asintota tipo=horizontal]]

## 2. Asíntota vertical

Si al acercarse a un punto la función se dispara:

$$\\lim_{x \\to a} f(x) = \\pm\\infty$$

entonces la recta $x = a$ es una asíntota vertical. En las funciones racionales, esos puntos
$a$ son justamente los que **no** pertenecen al dominio: los que anulan el denominador.

[[grafica-asintota tipo=vertical]]

## 3. Asíntota oblicua

La recta $y = mx + b$, con $m \\neq 0$, es una asíntota oblicua si

$$\\lim_{x \\to \\pm\\infty} \\left[ f(x) - (mx + b) \\right] = 0$$

donde los dos coeficientes se calculan con estos límites:

$$m = \\lim_{x \\to \\pm\\infty} \\frac{f(x)}{x} \\qquad b = \\lim_{x \\to \\pm\\infty} \\left[ f(x) - mx \\right]$$

**Cuándo buscarla:** solo hay asíntota oblicua si el grado del numerador es exactamente uno
mayor que el del denominador. Y se busca únicamente si **no** hay asíntota horizontal: las dos
son excluyentes.

[[grafica-asintota tipo=oblicua]]

:::desplegable Ejemplo 1: hay oblicua, no horizontal

$$f(x) = \\frac{x^2 + 2}{x - 2}$$

**a) Vertical.** Se busca dónde se anula el denominador: $x - 2 = 0$, o sea $x = 2$. Ahí el numerador vale $6 \\neq 0$, así que la fracción se dispara y

$$x = 2 \\text{ es asíntota vertical.}$$

**b) Horizontal.** Se mira el límite en el infinito. Arriba es de grado 2 y abajo de grado 1, así que el numerador gana y el cociente crece sin tope:

$$\\lim_{x \\to \\infty} \\frac{x^2 + 2}{x - 2} = \\infty \\quad \\Rightarrow \\quad \\text{no hay horizontal.}$$

**c) Oblicua.** Como no hay horizontal y el numerador supera al denominador en exactamente un grado, sí puede haberla. Se calculan los dos coeficientes:

$$m = \\lim_{x \\to \\infty} \\frac{f(x)}{x} = \\lim_{x \\to \\infty} \\frac{x^2 + 2}{x^2 - 2x} = 1$$

$$b = \\lim_{x \\to \\infty} \\left[ f(x) - mx \\right] = \\lim_{x \\to \\infty} \\frac{x^2 + 2 - x(x-2)}{x - 2} = \\lim_{x \\to \\infty} \\frac{2x + 2}{x - 2} = 2$$

$$\\boxed{y = x + 2}$$

Pulsa **Resolver** para verlo dibujado:

[[asintotas expr=(x^2+2)/(x-2)]]
:::

:::desplegable Ejemplo 2: hay horizontal, no oblicua

$$f(x) = \\frac{2x^2 + 3}{x^2 - 1}$$

**a) Vertical.** El denominador se anula en $x^2 - 1 = 0$, es decir $x = 1$ y $x = -1$. En los dos el numerador no se anula, así que

$$x = 1 \\quad \\text{y} \\quad x = -1 \\text{ son asíntotas verticales.}$$

**b) Horizontal.** Numerador y denominador son del mismo grado, así que el límite es el cociente de los coeficientes de mayor grado. Dividiendo todo entre $x^2$:

$$\\lim_{x \\to \\infty} \\frac{2 + \\frac{3}{x^2}}{1 - \\frac{1}{x^2}} = \\frac{2 + 0}{1 - 0} = 2 \\quad \\Rightarrow \\quad \\boxed{y = 2}$$

**c) Oblicua.** No se busca: ya hay horizontal y las dos son excluyentes.

Pulsa **Resolver** para verlo dibujado:

[[asintotas expr=(2x^2+3)/(x^2-1)]]
:::

:::desplegable Ejemplo 3: dos verticales y una horizontal negativa

$$f(x) = \\frac{2x^2}{9 - x^2}$$

**a) Vertical.** El denominador se anula en $9 - x^2 = 0$, o sea $x = 3$ y $x = -3$, una a cada lado del eje:

$$x = 3 \\quad \\text{y} \\quad x = -3 \\text{ son asíntotas verticales.}$$

**b) Horizontal.** Mismo grado arriba y abajo, así que otra vez el cociente de los coeficientes principales. Ojo con el signo: abajo el término de mayor grado es $-x^2$.

$$\\lim_{x \\to \\infty} \\frac{2x^2}{9 - x^2} = \\frac{2}{-1} = -2 \\quad \\Rightarrow \\quad \\boxed{y = -2}$$

La asíntota queda **por debajo** del eje, aunque la función tenga el numerador positivo.

**c) Oblicua.** No hay, por la misma razón que antes.

Pulsa **Resolver** para verlo dibujado:

[[asintotas expr=2x^2/(9-x^2)]]
:::

## Resumen

- **Horizontal:** se mira el límite cuando $x \\to \\pm\\infty$. Si da un número, esa es la altura.
- **Vertical:** se miran los puntos fuera del dominio. Si el límite ahí se dispara, hay asíntota.
- **Oblicua:** solo si no hay horizontal y el numerador supera al denominador en exactamente un grado.
        `
      },
      {
        id: '1.6',
        titulo: 'Teoremas básicos sobre límites',
        descripcion: 'Los diez teoremas que permiten calcular límites y afirmar continuidad sin volver a la definición: composición, operaciones, potencias inversas, raíces, intercalación, polinomios y valor intermedio.',
        contenido: `
## De qué trata este tema

Estos son los teoremas que permiten calcular límites y afirmar continuidad sin recurrir cada vez a la definición. Cada uno trae su enunciado, qué significa en palabras y un ejemplo resuelto.

## 1. Teorema de continuidad de una función compuesta

**Enunciado.** Si la función $g$ es continua en $a$ y la función $f$ es continua en $g(a)$, entonces la función compuesta $f \\circ g$ es continua en $a$.

**Explicación.** Si tienes una función anidada dentro de otra, el resultado global no tendrá interrupciones (saltos) si la parte interna es continua en tu punto inicial y la externa también lo es en el resultado que arrojó la primera.

:::desplegable Ejemplo: $f(g(x)) = \\cos(x^2)$ en $x = \\pi$

Sea $g(x) = x^2$ y $f(x) = \\cos(x)$. Queremos evaluar en $x = \\pi$.

Sabemos que $g$ es continua en $\\pi$ y da como resultado $\\pi^2$. Como $f(x)$ también es continua en $\\pi^2$, concluimos que la función compuesta $f(g(x)) = \\cos(x^2)$ es continua en $x = \\pi$.
:::

## 2. Teorema del límite de una función compuesta

**Enunciado.** Si $\\lim_{x \\to a} g(x) = b$ y la función $f$ es continua en $b$, entonces

$$\\lim_{x \\to a} (f \\circ g)(x) = f(b) \\qquad \\text{o lo que es lo mismo} \\qquad \\lim_{x \\to a} f(g(x)) = f\\left( \\lim_{x \\to a} g(x) \\right)$$

**Explicación.** Este teorema permite meter el límite dentro de la función principal, siempre y cuando esa función exterior sea continua. Calculas hacia dónde tiende la parte de adentro y a ese resultado le aplicas la función de afuera.

:::desplegable Ejemplo: $\\lim_{x \\to 0} e^{2x + 1}$

El límite de la función interna es

$$\\lim_{x \\to 0} (2x + 1) = 1$$

y la función externa $e^x$ es continua en $x = 1$, así que solo hay que evaluar el resultado:

$$\\lim_{x \\to 0} e^{2x + 1} = e^1 = \\boxed{e}$$
:::

## 3. Teoremas sobre continuidad (operaciones básicas)

**Enunciado.** Si $f$ y $g$ son continuas en un número $a$, entonces también son continuas en $a$:

- Suma o resta: $f \\pm g$
- Multiplicación: $f \\cdot g$
- División: $f / g$

**Explicación.** Al combinar funciones continuas con aritmética, la nueva función hereda esa continuidad en el mismo punto, sin romperse. En la división hay que añadir la condición de que el denominador no se anule en ese punto.

:::desplegable Ejemplo: $h(x) = x^3 + \\sin(x)$

Si $f(x) = x^3$ es continua en todo su dominio y $g(x) = \\sin(x)$ también lo es, entonces su suma

$$h(x) = x^3 + \\sin(x)$$

es continua en cualquier punto, por ejemplo en $x = 0$.
:::

## 4. Teorema de límites al infinito con constantes

**Enunciado.** Si $\\lim_{x \\to a} f(x) = \\infty$ y $\\lim_{x \\to a} g(x) = c$, con $c$ un número real, entonces:

$$\\lim_{x \\to a} \\left[ g(x) + f(x) \\right] = \\infty$$

$$\\text{si } c > 0: \\quad \\lim_{x \\to a} \\left[ g(x) f(x) \\right] = \\infty \\qquad \\text{si } c < 0: \\quad \\lim_{x \\to a} \\left[ g(x) f(x) \\right] = -\\infty$$

**Explicación.** Define las reglas de interacción con el infinito. Sumarle un número real a infinito no le afecta, sigue siendo infinito. Multiplicarlo por un positivo lo mantiene como infinito positivo, y multiplicarlo por un negativo le invierte el signo.

:::desplegable Ejemplo: $\\lim_{x \\to 0^+} \\left( -5 \\cdot \\frac{1}{x} \\right)$

Aquí $g(x) = -5$, así que $c < 0$, y $f(x) = \\frac{1}{x}$ tiende a $\\infty$ por la derecha. Como la constante es negativa, el producto invierte el signo:

$$\\lim_{x \\to 0^+} \\left( -5 \\cdot \\frac{1}{x} \\right) = \\boxed{-\\infty}$$
:::

## 5. Teorema de límites de potencias inversas

**Enunciado.** Para un entero positivo $n$ en la expresión $\\frac{1}{(x-a)^n}$:

$$\\text{si } n \\text{ es par:} \\quad \\lim_{x \\to a} \\frac{1}{(x-a)^n} = \\infty$$

$$\\text{si } n \\text{ es impar:} \\quad \\lim_{x \\to a^+} \\frac{1}{(x-a)^n} = \\infty \\qquad \\lim_{x \\to a^-} \\frac{1}{(x-a)^n} = -\\infty$$

**Explicación.** Dividir un número constante entre algo que se acerca a cero genera un valor gigantesco. Si el exponente es par la expresión siempre es positiva, así que se dispara al infinito por los dos lados. Si es impar, conserva el signo del lado por el que te acercas.

:::desplegable Ejemplo: exponente par y exponente impar

Con exponente par el límite es el mismo por ambos lados:

$$\\lim_{x \\to 3} \\frac{1}{(x-3)^2} = \\infty$$

Con exponente impar depende del lado. Acercándose por la izquierda:

$$\\lim_{x \\to 3^-} \\frac{1}{(x-3)^3} = -\\infty$$
:::

## 6. Teorema del límite de una raíz

**Enunciado.** Si el límite $\\lim_{x \\to a} f(x)$ existe, entonces

$$\\lim_{x \\to a} \\sqrt[n]{f(x)} = \\sqrt[n]{\\lim_{x \\to a} f(x)}$$

siempre que $n$ sea un entero positivo impar, o que $n$ sea par y además $\\lim_{x \\to a} f(x) > 0$.

**Explicación.** Se puede calcular el límite metiéndolo directamente dentro de la raíz. La única restricción es que no existen raíces reales de índice par para números negativos, así que en esos casos el interior debe tender a un valor mayor que cero.

:::desplegable Ejemplo: $\\lim_{x \\to 2} \\sqrt{3x + 10}$

$$\\lim_{x \\to 2} \\sqrt{3x + 10} = \\sqrt{\\lim_{x \\to 2} (3x + 10)} = \\sqrt{6 + 10} = \\sqrt{16} = \\boxed{4}$$
:::

## 7. Teorema de la intercalación (del emparedado)

**Enunciado.** Supóngase que para todo $x$ en un intervalo abierto alrededor de $a$ (excepto quizá en $x = a$) se cumple que $f(x) \\leq h(x) \\leq g(x)$. Si

$$\\lim_{x \\to a} f(x) = L \\qquad \\text{y} \\qquad \\lim_{x \\to a} g(x) = L$$

entonces

$$\\lim_{x \\to a} h(x) = L$$

**Explicación.** Si una función $h(x)$ queda aplastada entre otras dos y esas dos convergen al mismo punto, la del centro está obligada a ir también hacia ese punto.

:::desplegable Ejemplo: $\\lim_{x \\to 0} x^2 \\cos\\left(\\frac{1}{x}\\right)$

El coseno siempre vive entre $-1$ y $1$, pase lo que pase dentro:

$$-1 \\leq \\cos\\left(\\frac{1}{x}\\right) \\leq 1$$

Multiplicando por $x^2$, que es positivo, la desigualdad no cambia de sentido:

$$-x^2 \\leq x^2 \\cos\\left(\\frac{1}{x}\\right) \\leq x^2$$

Los dos extremos van al mismo sitio:

$$\\lim_{x \\to 0} (-x^2) = 0 \\qquad \\lim_{x \\to 0} x^2 = 0$$

Así que la función atrapada en el centro tiene el mismo límite:

$$\\lim_{x \\to 0} x^2 \\cos\\left(\\frac{1}{x}\\right) = \\boxed{0}$$
:::

## 8. Teorema del límite de un polinomio

**Enunciado.** Si $f$ es un polinomio y $a$ es un número real, entonces

$$\\lim_{x \\to a} f(x) = f(a)$$

**Explicación.** Las funciones polinómicas son continuas en todos los reales. Para hallar su límite en cualquier punto no hacen falta artificios algebraicos: basta sustituir la variable por el valor al que tiende.

:::desplegable Ejemplo: $\\lim_{x \\to 2} (x^3 - 2x + 5)$

Se evalúa directamente:

$$f(2) = (2)^3 - 2(2) + 5 = 8 - 4 + 5 = \\boxed{9}$$
:::

## 9. Teorema del cero intermedio

**Enunciado.** Si $f$ es continua en el intervalo cerrado $[a, b]$ y los valores en los extremos $f(a)$ y $f(b)$ tienen signos opuestos, entonces existe un número $c$ entre $a$ y $b$ tal que

$$f(c) = 0$$

**Explicación.** Si dibujas un trayecto continuo que empieza por debajo del eje horizontal y termina por encima, o al revés, la línea tiene que atravesar el eje en algún punto del camino.

:::desplegable Ejemplo: $f(x) = x^2 - 3$ en $[1, 2]$

En los extremos del intervalo la función cambia de signo:

$$f(1) = 1^2 - 3 = -2 \\quad (\\text{negativo}) \\qquad f(2) = 2^2 - 3 = 1 \\quad (\\text{positivo})$$

Como hay cambio de signo y la función es continua, el teorema garantiza que se hace cero en algún punto $c$ entre 1 y 2. Esa raíz es $\\sqrt{3} \\approx 1{,}732$.
:::

## 10. Teorema del valor intermedio

**Enunciado.** Si $f$ es continua en el intervalo cerrado $[a, b]$ y $f(a) \\neq f(b)$, entonces para cada valor $k$ entre $f(a)$ y $f(b)$ existe un número $c$ entre $a$ y $b$ tal que

$$f(c) = k$$

**Explicación.** Es la versión general del teorema anterior. Una función continua no puede saltarse alturas: si va desde una altura inicial hasta una final, tiene que pasar por todas las intermedias.

:::desplegable Ejemplo: el peso de una persona

Supongamos que una persona nace pesando 3 kg y a los 20 años pesa 70 kg. El crecimiento es un proceso continuo.

Entonces, sin importar qué peso elijamos dentro de ese rango (por ejemplo $k = 45$ kg), el teorema garantiza que en algún instante exacto de su vida esa persona pesó exactamente 45 kg.
:::
        `
      },
      {
        id: '1.7',
        titulo: 'Continuidad',
        descripcion: 'Las tres condiciones de continuidad en un punto, los dos tipos de discontinuidad y ejemplos resueltos con funciones por partes y racionales.',
        contenido: `
## Definición

Una [función](/conceptos-previos#funciones) $f$ es continua en un número $a$ si se satisfacen las tres condiciones siguientes:

- **i)** $f$ está definida en un intervalo abierto que contiene a $a$, es decir, $f(a)$ existe.
- **ii)** $\\lim_{x \\to a} f(x)$ existe.
- **iii)** $\\lim_{x \\to a} f(x) = f(a)$.

Las tres son obligatorias y se revisan en ese orden. En cuanto una falla, la función es discontinua en $a$ y ya no hace falta mirar las demás.

Dicho sin fórmulas: la función tiene que existir en el punto, tiene que acercarse a algo al llegar ahí, y ese algo tiene que ser justamente su valor.

## Ejemplo: $f(x) = \\frac{1}{x - 2}$

Su dominio es $\\mathbb{R} - \\{2\\}$, porque en $x = 2$ el denominador se anula.

**i)** $f(2)$ no existe, luego $f$ no es continua en $x = 2$.

Falla la primera condición, así que no hay que seguir. En la gráfica se ve como una asíntota vertical: la curva se dispara a ambos lados del punto en vez de pasar por él.

[[asintotas expr=1/(x-2)]]

## Tipos de discontinuidad

Cuando una función falla alguna de las tres condiciones, la discontinuidad puede ser de dos familias, según si el límite existe o no.

### Discontinuidad esencial (no removible)

Tanto en la discontinuidad **de salto** como en la **infinita**, el $\\lim_{x \\to a} f(x)$ **no existe**. Por eso a este tipo se le conoce como discontinuidad esencial: no hay manera de arreglarla redefiniendo un punto.

[[grafica tipo=salto]]

[[grafica tipo=infinita]]

### Discontinuidad removible (evitable)

Aquí $f$ es discontinua en $a$ **pero el $\\lim_{x \\to a} f(x)$ sí existe**. Lo que ocurre es que $f(a)$ no existe, o bien $f(a) \\neq \\lim_{x \\to a} f(x)$.

[[grafica tipo=evitable]]

Como el límite existe, basta redefinir la función en ese único punto para taparle el hueco. De ahí el nombre.

El estudio completo de los dos tipos, con más ejemplos, está en [Discontinuidad esencial y evitable](/calculo1/limites/1.8).

## Ejemplo con función por partes

$$h(x) = \\begin{cases} 3 + x & \\text{si } x \\leq 1 \\\\ 3 - x & \\text{si } x > 1 \\end{cases}$$

Veamos si $h$ es continua en $x = 1$.

**i)** $h(1) = 3 + 1 = 4$. La función sí está definida en el punto.

**ii)** Hay que mirar los dos lados por separado, porque la fórmula cambia justo ahí:

$$\\lim_{x \\to 1^-} (3 + x) = 4 \\qquad \\lim_{x \\to 1^+} (3 - x) = 2$$

Los laterales no coinciden, luego $\\lim_{x \\to 1} h(x)$ **no existe**.

Por tanto $h$ no es continua en $x = 1$. Como el límite no existe, la discontinuidad es **de salto**, es decir, esencial.

## Ejemplos: estudiar la continuidad

:::desplegable Ejemplo 1: $f(x) = 2x + 3$ si $x \\neq 1$, y $f(x) = 2$ si $x = 1$

**i)** $f(1) = 2$. La función está definida en el punto.

**ii)** El límite se calcula con la otra rama, la que vale para $x \\neq 1$:

$$\\lim_{x \\to 1} (2x + 3) = 2(1) + 3 = 5$$

**iii)** Aquí falla:

$$f(1) = 2 \\neq 5 = \\lim_{x \\to 1} f(x)$$

Por tanto $f$ es discontinua en $x = 1$. Pero como el límite **existe** y vale $5$, la discontinuidad es **removible**: basta redefinir la función en ese punto.

$$F(x) = \\begin{cases} 2x + 3 & \\text{si } x \\neq 1 \\\\ 5 & \\text{si } x = 1 \\end{cases}$$

Esta $F$ ya es continua en $x = 1$, porque ahora el valor coincide con el límite.
:::

:::desplegable Ejemplo 2: $f(x) = \\frac{\\sqrt{x} - 2}{x - 4}$

Su dominio es $(0, \\infty) - \\{4\\}$. Mostremos que $f$ es discontinua en $x = 4$.

**i)** $f(4)$ no existe, porque el denominador se anula.

**ii)** El límite sí existe. Al sustituir sale $\\frac{0}{0}$, así que se multiplica y se divide por el conjugado del numerador para quitar la raíz:

$$\\lim_{x \\to 4} \\frac{\\sqrt{x} - 2}{x - 4} = \\lim_{x \\to 4} \\frac{(\\sqrt{x} - 2)(\\sqrt{x} + 2)}{(x - 4)(\\sqrt{x} + 2)} = \\lim_{x \\to 4} \\frac{x - 4}{(x - 4)(\\sqrt{x} + 2)}$$

Se cancela $x - 4$ y queda:

$$\\lim_{x \\to 4} \\frac{1}{\\sqrt{x} + 2} = \\frac{1}{\\sqrt{4} + 2} = \\boxed{\\frac{1}{4}}$$

Falla la primera condición pero el límite existe, así que $f$ tiene una **discontinuidad removible** en $x = 4$.
:::

## Ejercicio

Determine todos los valores de $c$ para los cuales $f$ es continua.

$$f(x) = \\begin{cases} c^2 x & \\text{si } x < 1 \\\\ 3cx & \\text{si } x \\geq 1 \\end{cases}$$

:::desplegable Ver la resolución

El único punto dudoso es $x = 1$, donde cambia la fórmula. En el resto la función es un polinomio y es continua siempre.

**i)** La segunda rama cubre $x = 1$, así que el valor existe:

$$f(1) = 3c(1) = 3c$$

**ii)** Para que el límite exista, los dos laterales tienen que coincidir:

$$\\lim_{x \\to 1^-} c^2 x = c^2 \\qquad \\lim_{x \\to 1^+} 3cx = 3c$$

**iii)** Igualando las tres cosas, la condición de continuidad queda:

$$c^2 = 3c$$

Se pasa todo a un lado y se factoriza, sin dividir entre $c$ para no perder una solución:

$$c^2 - 3c = 0 \\quad \\Rightarrow \\quad c(c - 3) = 0$$

$$\\boxed{c = 0 \\quad \\text{o} \\quad c = 3}$$

Comprobación rápida: con $c = 0$ las dos ramas valen $0$ y la función es la constante cero; con $c = 3$ queda $9x$ a la izquierda y $9x$ a la derecha, la misma recta.
:::

## Teoremas sobre continuidad

Al combinar funciones continuas con sumas, restas, productos, cocientes o composición, el resultado sigue siendo continuo. Esos teoremas, con sus ejemplos, están reunidos en [Teoremas básicos sobre límites](/calculo1/limites/1.6).
        `
      },
      {
        id: '1.8',
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
      },
      {
        id: '1.9',
        titulo: 'Límites de funciones exponenciales y logarítmicas',
        descripcion: 'Comportamiento de límites cuando participan funciones exponenciales y logarítmicas.',
        contenido: `
## Introducción

Estudiamos el comportamiento de los [límites](/calculo1/limites/1.1) cuando participan [funciones exponenciales](/conceptos-previos#exponenciales) y [funciones logarítmicas](/conceptos-previos#logaritmos).

## Funciones exponenciales

### Límite fundamental
$$\\lim_{x \\to \\infty} e^x = \\infty$$
$$\\lim_{x \\to -\\infty} e^x = 0$$

### Con base general
$$\\lim_{x \\to \\infty} a^x = \\infty \\quad (\\text{si } a > 1)$$
$$\\lim_{x \\to \\infty} a^x = 0 \\quad (\\text{si } 0 < a < 1)$$

## Funciones logarítmicas

### Definición

Sea $a > 0$, la expresión $y = \\log_{a}(x)$ se llama **logaritmo en base $a$ de $x$**.

$$y = \\log_{a}(x) \\iff x = a^{y}$$

Es decir: el logaritmo *deshace* la exponencial. Si $x = 2^{3}$, entonces $\\log_{2}(8) = 3$, porque la base elevada a $3$ da el argumento.

> **Nota:** un logaritmo en base $e$ se conoce como **logaritmo natural**, esto es $\\log_{e}(x) = \\ln(x)$.

### Límite fundamental
$$\\lim_{x \\to \\infty} \\ln(x) = \\infty$$
$$\\lim_{x \\to 0^+} \\ln(x) = -\\infty$$

### Propiedades de los límites y gráficas

Todo depende de si la base $a$ es mayor o menor que $1$. El dominio es siempre el mismo, pero el comportamiento se invierte por completo:

| Concepto | Si $a > 1$ | Si $0 < a < 1$ |
|---|---|---|
| Gráfica | **Creciente** | **Decreciente** |
| Dominio $D_f$ | $\\mathbb{R}^{+}$ | $\\mathbb{R}^{+}$ |
| Cuando $x \\to \\infty$ | $\\lim_{x \\to \\infty} \\log_{a}(x) = \\infty$ | $\\lim_{x \\to \\infty} \\log_{a}(x) = -\\infty$ |
| Cuando $x \\to 0^{+}$ | $\\lim_{x \\to 0^{+}} \\log_{a}(x) = -\\infty$ | $\\lim_{x \\to 0^{+}} \\log_{a}(x) = \\infty$ |

Fíjate en la simetría: los dos casos intercambian el $+\\infty$ y el $-\\infty$. La diferencia no está en el dominio, sino en si la función **sube o baja**.

### Gráfica del caso $a > 1$

[[grafica-limite expr=log(x) punto=0]]

Esta es $\\log_{e}(x) = \\ln(x)$, de base mayor que $1$. El encuadre es la ventana alrededor de $0$: al acercarse por la derecha, la curva **se hunde** sin cota, que es el $-\\infty$ de la tabla. El $+\\infty$ en $x \\to \\infty$ es la misma curva creciendo, pero fuera de este encuadre.

### Gráfica del caso $0 < a < 1$

[[grafica-limite expr=log(x)/log(0.5) punto=0]]

Esta es $\\log_{0.5}(x) = \\frac{\\ln(x)}{\\ln(0.5)}$, de base menor que $1$. La curva sale **volteada**: al acercarse a $0$ por la derecha, se **dispara** hacia arriba, que es el $+\\infty$ de la tabla.

Los números detrás de las dos gráficas:

| $x$ | $\\log_{e}(x) = \\ln(x)$ | $\\log_{0.5}(x)$ |
|---|---|---|
| $0.1$ | $-2.30$ | $3.32$ |
| $0.01$ | $-4.61$ | $6.64$ |
| $0.001$ | $-6.91$ | $9.97$ |
| $0.0001$ | $-9.21$ | $13.29$ |

Una columna baja sin parar y la otra sube sin parar, y las dos son el espejo de la otra. Ninguna se estabiliza, así que **ninguna tiene asíntota horizontal**: en los dos casos el límite en el infinito es infinito.

### Ejemplos Prácticos

:::desplegable Ejemplo 1: Análisis de límites laterales

Sea $f(x) = \\log(x^2 - 9)$. La función de dentro es $x^2 - 9$, y el logaritmo exige que su argumento sea **positivo**, de ahí el dominio:

$$x^2 - 9 > 0 \\implies D_f: (-\\infty, -3) \\cup (3, \\infty)$$

**i)** Lado izquierdo de $x = -3$:

$$\\lim_{x \\to -3^-} \\log(x^2 - 9) = \\log\\left[ \\lim_{x \\to -3^-} (x^2 - 9) \\right] = \\log(0^{+}) = -\\infty$$

**ii)** Lado derecho de $x = 3$:

$$\\lim_{x \\to 3^+} \\log(x^2 - 9) = \\log\\left[ \\lim_{x \\to 3^+} (x^2 - 9) \\right] = \\log(0^{+}) = -\\infty$$

**iii)** En $x = 0$ el argumento es negativo:

$$\\lim_{x \\to 0} \\log(x^2 - 9) = \\log(-9)$$

El logaritmo de un número negativo **no existe en los reales**, así que aquí el límite no existe.

**iv)** Al infinito el argumento crece sin límite:

$$\\lim_{x \\to \\infty} \\log(x^2 - 9) = \\infty$$
:::

:::desplegable Ejemplo 2: Límites con indeterminación

Sea $g(x) = \\frac{4x + 1}{\\ln(2x + 3)}$ y se pide el límite en $x = -1$.

**i)** Sustituyendo directamente:

$$\\lim_{x \\to -1} \\frac{4x + 1}{\\ln(2x + 3)} = \\frac{4(-1) + 1}{\\ln(2(-1) + 3)} = \\frac{-3}{\\ln(1)} = \\frac{-3}{0}$$

El cociente $\\frac{-3}{0}$ es una **indeterminación**: con solo el resultado no se puede decidir el signo.

**ii)** Lateral derecho, $x \\to -1^{+}$:

$$\\lim_{x \\to -1^{+}} \\frac{4x + 1}{\\ln(2x + 3)} = \\frac{-3}{0^{+}} = -\\infty$$

**iii)** Lateral izquierdo, $x \\to -1^{-}$:

$$\\lim_{x \\to -1^{-}} \\frac{4x + 1}{\\ln(2x + 3)} = \\frac{-3}{0^{-}} = +\\infty$$

> **Conclusión:** los dos laterales dan resultados distintos, así que el límite no existe. La indeterminación $\\frac{-3}{0}$ solo se resuelve mirando cada lado por separado.
:::

:::desplegable Ejemplo 3: Aplicando órdenes de infinito

$$\\lim_{x \\to \\infty} \\frac{e^x}{x^{25} - 25}$$

**i)** El numerador es una [exponencial](/conceptos-previos#exponenciales) y el denominador un polinomio de grado $25$.

**ii)** Por [órdenes de infinito](/calculo1/limites/1.4), la exponencial le gana a cualquier polinomio: $e^x > x^{25}$ para $x$ suficientemente grande.

**iii)** El cociente crece sin límite:

$$\\lim_{x \\to \\infty} \\frac{e^x}{x^{25} - 25} = \\boxed{\\infty}$$
:::

:::desplegable Ejemplo 4: Órdenes de infinito con logaritmos

$$\\lim_{x \\to \\infty} \\frac{\\log(x^{30} - 56)}{2x^2}$$

**i)** El numerador es un logaritmo, que crece **muy lento**, y el denominador es un polinomio de grado $2$.

**ii)** El denominador domina porque $x^2 > \\log(x^{30})$: la exponencial de base $a$ crece mucho más rápido que cualquier potencia de $x$.

**iii)** El cociente se achica sin parar:

$$\\lim_{x \\to \\infty} \\frac{\\log(x^{30} - 56)}{2x^2} = \\boxed{0}$$

Es el mismo criterio del tema de [límites al infinito](/calculo1/limites/1.4), solo que ahora el que gana es el denominador.
:::

## Ejemplo práctico

$$\\lim_{x \\to \\infty} \\frac{e^x}{x^2} \\to \\frac{\\infty}{\\infty}$$

Aplicando [Regla de L'Hôpital](/calculo1/aplicaciones/3.9) dos veces:
$$\\lim_{x \\to \\infty} \\frac{e^x}{2x} = \\lim_{x \\to \\infty} \\frac{e^x}{2} = \\infty$$

## Ejemplo con logaritmo

$$\\lim_{x \\to \\infty} \\frac{\\ln(x)}{x} = 0$$

El [logaritmo](/conceptos-previos#logaritmos) crece más lento que cualquier [polinomio](/conceptos-previos#polinomios).

## Aplicación
- Crecimiento poblacional
- [Interés compuesto](/calculo1/derivadas/2.7)
- Decaimiento radiactivo
        `
      },
      {
        id: '1.10',
        titulo: 'Límites trigonométricos',
        descripcion: 'Límites fundamentales y ejemplos prácticos explicados paso a paso para evitar indeterminaciones.',
        contenido: `
## Teorema: Límites Fundamentales

Los límites trigonométricos se resuelven utilizando identidades y un grupo de teoremas clave que sirven como herramientas para evitar indeterminaciones del tipo $\\frac{0}{0}$.

1. $\\lim_{x \\to 0} \\operatorname{sen}(x) = 0$
2. $\\lim_{x \\to 0} \\cos(x) = 1$
3. $\\lim_{x \\to 0} \\frac{\\operatorname{sen}(x)}{x} = 1$
4. $\\lim_{x \\to 0} \\frac{1 - \\cos(x)}{x} = 0$

### Teorema 3 en la gráfica: $\\frac{\\operatorname{sen}(x)}{x}$

[[tabla-limite expr=sin(x)/x punto=0 visual=estatico]]

Al entrar en $x = 0$ por cualquiera de los dos lados, la curva se acerca a $1$. Ojo con el círculo hueco en el origen: la función **no está definida** ahí (sale $\\frac{0}{0}$), pero el límite existe igual. Eso es exactamente una discontinuidad removible.

### Teorema 4 en la gráfica: $\\frac{1 - \\cos(x)}{x}$

[[tabla-limite expr=(1-cos(x))/x punto=0 visual=estatico]]

Aquí la curva se acerca a $0\) por los dos lados, así que el límite es $0$.

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

---

### Ejemplo 3: Calcular $\\lim_{\\theta \\to \\pi} \\theta \\sec(\\theta)$

1. **Reescribe la secante:** Como $\\sec(\\theta) = \\frac{1}{\\cos(\\theta)}$, el límite es un producto:
   $$\\lim_{\\theta \\to \\pi} \\theta \\cdot \\frac{1}{\\cos(\\theta)}$$
2. **Sustituye:** Aquí **no hay indeterminación**, porque $\\cos(\\pi) = -1$ y el denominador no se anula. Así que cada factor se evalúa por separado:
   $$\\pi \\cdot \\frac{1}{\\cos(\\pi)} = \\pi \\cdot \\frac{1}{-1}$$
3. **Resultado:**
   $$\\boxed{-\\pi}$$

Fíjate en el contraste con los ejemplos anteriores: aquí la función es continua en $\\theta = \\pi$, y por eso se puede sustituir directamente.

---

### Ejemplo 4: Calcular $\\lim_{x \\to 0} \\left( \\frac{2x + 1 - \\cos(x)}{3x} \\right)$

1. **Identifica el problema:** Sustituyendo $x = 0$ en el numerador sale $0 + 1 - 1 = 0$, y el denominador también vale $0$. Otra vez $\\frac{0}{0}$.
2. **Separa las fracciones:** Como el denominador $3x$ es el mismo en toda la expresión, se reparte entre los dos sumandos del numerador:
   $$\\lim_{x \\to 0} \\left( \\frac{2x}{3x} + \\frac{1 - \\cos(x)}{3x} \\right)$$
3. **Factoriza y aplica el teorema 4:** El primer cociente se simplifica y el segundo se saca el $3$ como factor:
   $$\\lim_{x \\to 0} \\frac{2}{3} + \\frac{1}{3} \\lim_{x \\to 0} \\frac{1 - \\cos(x)}{x} = \\frac{2}{3} + \\frac{1}{3}(0)$$
4. **Resultado:**
   $$\\boxed{\\frac{2}{3}}$$

Aquí el teorema 4 entra como una pieza más: no hace falta resolver la indeterminación entera, solo el cociente que la acompaña.

## Aplicación en derivadas
Estos [límites](/calculo1/limites/1.1) son esenciales para demostrar las [fórmulas de derivación](/calculo1/derivadas/2.6):
- $\\frac{d}{dx}\\sin(x) = \\cos(x)$
- $\\frac{d}{dx}\\cos(x) = -\\sin(x)$
        `
      }
    ]
  },
  {
    id: 'derivadas',
    titulo: 'Derivadas',
    descripcion: 'Mide cómo cambia una función en un instante específico. Representa la razón de cambio instantánea y la pendiente de la recta tangente.',
    icono: '∂',
    color: '#4F46E5',
    temas: [
      {
        id: '2.1',
        titulo: 'Introducción – Definición de derivada',
        descripcion: 'La derivada indica qué tan rápido cambia una cantidad en un momento determinado.',
        contenido: `
## Introducción

La [derivada](/calculo1/derivadas/2.1) es uno de los conceptos más importantes del cálculo diferencial, ya que mide cómo cambia una [función](/conceptos-previos#funciones) en un instante específico. Representa la razón de cambio instantánea.

## Definición formal

$$f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

Donde:
- $f(x+h) - f(x)$ representa el cambio en la [función](/conceptos-previos#funciones).
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

Geométricamente, la [derivada](/calculo1/derivadas/2.1) representa la pendiente de la [recta tangente](/conceptos-previos#recta-tangente) a una curva en un punto.

- Pendiente positiva → la [función](/conceptos-previos#funciones) crece.
- Pendiente negativa → la [función](/conceptos-previos#funciones) decrece.
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

Permiten derivar [funciones](/conceptos-previos#funciones) sin usar siempre la [definición por límite](/calculo1/derivadas/2.1).

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

Se utiliza cuando una [función](/conceptos-previos#funciones) está dentro de otra [función](/conceptos-previos#funciones) (funciones compuestas).

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

Incluye [funciones polinomiales](/conceptos-previos#polinomios), [racionales](/conceptos-previos#racionales) y [radicales](/conceptos-previos#radicales).

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

[Derivadas](/calculo1/derivadas/2.1) de [funciones trigonométricas](/conceptos-previos#trigonometria) básicas y sus inversas.

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

Incluye la [función](/conceptos-previos#funciones) especial $e^x$ cuya [derivada](/calculo1/derivadas/2.1) es ella misma.

## Exponencial natural

$$\\frac{d}{dx}(e^x) = e^x$$

## Exponencial general

$$\\frac{d}{dx}(a^x) = a^x \\cdot \\ln(a)$$

## Logaritmo natural

$$\\frac{d}{dx}(\\ln x) = \\frac{1}{x}$$

## Ejemplo

$$f(x) = e^x + \\ln x \\implies f'(x) = e^x + \\frac{1}{x}$$

## Aplicación
- [Interés compuesto](/calculo1/limites/1.9)
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

Son [derivadas](/calculo1/derivadas/2.1) sucesivas que dan información sobre el comportamiento de la [función](/conceptos-previos#funciones).

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

El diferencial permite aproximar pequeños cambios en una [función](/conceptos-previos#funciones) usando su [derivada](/calculo1/derivadas/2.1).

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
    color: '#047857',
    temas: [
      {
        id: '3.1',
        titulo: 'Razones de cambio relacionadas',
        descripcion: 'Estudian situaciones donde dos o más variables cambian con respecto al tiempo y están conectadas.',
        contenido: `
## Introducción

Las razones de cambio relacionadas estudian situaciones donde dos o más [variables](/conceptos-previos#variables) cambian con respecto al tiempo y están conectadas por una [ecuación](/conceptos-previos#ecuaciones).

## Procedimiento general

1. Identificar [variables](/conceptos-previos#variables).
2. Relacionarlas mediante una [ecuación](/conceptos-previos#ecuaciones).
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

La primera [derivada](/calculo1/derivadas/2.1) permite determinar si una [función](/conceptos-previos#funciones) aumenta o disminuye.

## Criterios

- Si $f'(x) > 0$ → La [función](/conceptos-previos#funciones) **crece**.
- Si $f'(x) < 0$ → La [función](/conceptos-previos#funciones) **decrece**.

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

Son puntos donde la [función](/conceptos-previos#funciones) alcanza valores mayores o menores respecto a puntos cercanos.

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

La segunda [derivada](/calculo1/derivadas/2.1) indica cómo se curva la gráfica de una [función](/conceptos-previos#funciones).

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

1. Definir [función](/conceptos-previos#funciones) objetivo.
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

Si una [función](/conceptos-previos#funciones) continua en $[a,b]$ cumple $f(a) = f(b)$, existe un punto con [tangente](/calculo1/derivadas/2.2) horizontal.

## Condiciones

Si una [función](/conceptos-previos#funciones):
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

Estudio integral de una [función](/conceptos-previos#funciones):
- [Dominio](/conceptos-previos#dominio)
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