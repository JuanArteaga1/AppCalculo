/**
 * Talleres, quices y evaluaciones de la página pública "Evalúate".
 * Maqueta estática: las respuestas se corrigen en el navegador y no se guardan.
 */
export const TAREAS = [
  {
    id: 't1',
    tipo: 'Taller',
    titulo: 'Regla de la cadena',
    unidad: 'Derivadas',
    prof: 'Prof. Andrés Ruiz',
    vence: '28 sep',
    min: 15,
    preguntas: [
      {
        p: '¿Cuál es la derivada de f(x) = sin(2x)?',
        ops: ['cos(2x)', '2·cos(2x)', '−2·cos(2x)', '2·sin(2x)'],
        ok: 1,
        pista: 'Deriva la función de afuera y multiplica por la derivada de adentro.',
      },
      {
        p: 'Si f(x) = (3x + 1)⁵, entonces f′(x) es…',
        ops: ['5(3x + 1)⁴', '15(3x + 1)⁴', '3(3x + 1)⁴', '15(3x + 1)⁵'],
        ok: 1,
        pista: 'La derivada de lo de adentro es 3.',
      },
      {
        p: 'La regla de la cadena sirve para derivar…',
        ops: ['sumas de funciones', 'productos de funciones', 'funciones compuestas', 'funciones constantes'],
        ok: 2,
        pista: 'Piensa en f(g(x)).',
      },
    ],
  },
  {
    id: 't2',
    tipo: 'Quiz',
    titulo: 'Límites al infinito',
    unidad: 'Límites y Continuidad',
    prof: 'Prof. Andrés Ruiz',
    vence: '21 sep',
    min: 10,
    preguntas: [
      {
        p: 'Si f(x) = (3x² + 1)/(x² − 4), ¿cuál es el límite cuando x → ∞?',
        ops: ['0', '3', '∞', 'No existe'],
        ok: 1,
        pista: 'Compara los grados del numerador y del denominador.',
      },
      {
        p: 'El límite de 1/x cuando x → ∞ vale…',
        ops: ['1', '0', '∞', '−1'],
        ok: 1,
        pista: 'El denominador crece sin parar.',
      },
      {
        p: 'Una asíntota horizontal aparece cuando…',
        ops: ['el límite al infinito es un número', 'el límite al infinito es infinito', 'la función no existe', 'la derivada es cero'],
        ok: 0,
        pista: 'La curva se acerca a una altura fija.',
      },
    ],
  },
  {
    id: 't3',
    tipo: 'Evaluación',
    titulo: 'Unidad 1 · Límites y Continuidad',
    unidad: 'Límites y Continuidad',
    prof: 'Prof. Andrés Ruiz',
    vence: '12 sep',
    min: 40,
    preguntas: [
      {
        p: 'Los límites laterales de f en x = 1 valen 3 y 5. Entonces el límite en x = 1…',
        ops: ['vale 4', 'vale 3', 'no existe', 'vale 5'],
        ok: 2,
        pista: 'Para que exista, los dos lados deben coincidir.',
      },
      {
        p: 'Una función es continua en x = a cuando…',
        ops: ['existe f(a)', 'existe el límite en a', 'el límite en a es igual a f(a)', 'la derivada existe'],
        ok: 2,
        pista: 'Son tres condiciones juntas.',
      },
      {
        p: 'La indeterminación 0/0 significa que…',
        ops: ['el límite vale 0', 'el límite no existe', 'hay que simplificar o factorizar', 'la función es continua'],
        ok: 2,
        pista: 'Todavía no se puede decidir.',
      },
      {
        p: '¿Qué tipo de discontinuidad tiene f(x) = (x² − 4)/(x − 2) en x = 2?',
        ops: ['Removible', 'De salto', 'Esencial', 'Ninguna'],
        ok: 0,
        pista: 'Se puede tapar el hueco redefiniendo f(2).',
      },
    ],
  },
  {
    id: 't4',
    tipo: 'Taller',
    titulo: 'Máximos y mínimos',
    unidad: 'Aplicaciones de la Derivada',
    prof: 'Prof. Andrés Ruiz',
    vence: '5 oct',
    min: 20,
    preguntas: [
      {
        p: 'En un máximo relativo la primera derivada…',
        ops: ['es positiva', 'es negativa', 'vale cero o no existe', 'es constante'],
        ok: 2,
        pista: 'La recta tangente queda horizontal.',
      },
      {
        p: 'Si f″(x₀) < 0 en un punto crítico, entonces ahí hay…',
        ops: ['un mínimo', 'un máximo', 'una inflexión', 'nada'],
        ok: 1,
        pista: 'La curva abre hacia abajo.',
      },
      {
        p: 'Un punto de inflexión es donde…',
        ops: ['cambia la concavidad', 'la función vale cero', 'hay una asíntota', 'la derivada no existe'],
        ok: 0,
        pista: 'Piensa en la segunda derivada.',
      },
    ],
  },
];

/** Plural para las píldoras del filtro, sin reglas raras de acentuación. */
export const FILTROS_TAREA = [
  ['Todos', 'Todos'],
  ['Taller', 'Talleres'],
  ['Quiz', 'Quices'],
  ['Evaluación', 'Evaluaciones'],
];
