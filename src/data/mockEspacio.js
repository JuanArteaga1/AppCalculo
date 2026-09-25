/**
 * Datos de ejemplo para los espacios de estudiante y maestro.
 * Todavía no hay backend: estas constantes solo alimentan la maqueta
 * para poder revisar el diseño con el cliente.
 */

export const PERFILES = {
  estudiante: {
    nombre: 'María Benavidez',
    iniciales: 'MB',
    sub: 'Estudiante · Cálculo I',
    nota: { titulo: 'Taller 3', detalle: 'Entrega el 28 sep' },
  },
  maestro: {
    nombre: 'Prof. Andrés Ruiz',
    iniciales: 'AR',
    sub: 'Maestro · Cálculo I, grupo 03',
    nota: { titulo: '24 estudiantes', detalle: 'Grupo 03' },
  },
};

export const MENUS = {
  estudiante: [
    ['progreso', 'Mi progreso'],
    ['aprender', 'Evalúate'],
    ['laboratorio', 'Laboratorio'],
    ['videos', 'Mis videos'],
    ['tutor', 'Tutor IA'],
    ['ajustes', 'Ajustes'],
  ],
  maestro: [
    ['aprender', 'Evalúate'],
    ['estudiantes', 'Estudiantes'],
    ['laboratorio', 'Laboratorio'],
    ['videos', 'Mis videos'],
    ['tutor', 'Tutor IA'],
    ['ajustes', 'Ajustes'],
  ],
};

export const UNIDADES_PROGRESO = [
  { nombre: 'Límites', pct: 67, temas: '6 de 9 temas', sigue: '1.7 Límites al infinito' },
  { nombre: 'Derivadas', pct: 40, temas: '4 de 10 temas', sigue: '2.5 Regla de la cadena' },
  { nombre: 'Aplicaciones', pct: 17, temas: '2 de 12 temas', sigue: '3.3 Máximos y mínimos' },
];

export const EVALUACIONES = [
  {
    id: 'e1',
    titulo: 'Taller 3 · Regla de la cadena',
    tipo: 'Taller',
    unidad: 'Derivadas',
    vence: '28 sep',
    entregas: 18,
    total: 24,
    porCalificar: 6,
    alumno: { estado: 'pendiente', nota: null, comentario: '' },
  },
  {
    id: 'e2',
    titulo: 'Quiz 2 · Límites al infinito',
    tipo: 'Quiz',
    unidad: 'Límites',
    vence: '21 sep',
    entregas: 22,
    total: 24,
    porCalificar: 4,
    alumno: { estado: 'entregado', nota: null, comentario: '' },
  },
  {
    id: 'e3',
    titulo: 'Evaluación Unidad 1',
    tipo: 'Evaluación',
    unidad: 'Límites',
    vence: '10 sep',
    entregas: 24,
    total: 24,
    porCalificar: 0,
    alumno: { estado: 'calificado', nota: 4.5, comentario: 'Buen manejo de los límites laterales. Cuida la notación.' },
  },
  {
    id: 'e4',
    titulo: 'Taller 2 · Continuidad',
    tipo: 'Taller',
    unidad: 'Límites',
    vence: '3 sep',
    entregas: 24,
    total: 24,
    porCalificar: 0,
    alumno: { estado: 'calificado', nota: 4.0, comentario: 'Revisa el caso de la discontinuidad esencial.' },
  },
];

export const PREGUNTAS = [
  {
    p: '¿Cuál es la derivada de sin(2x)?',
    ops: ['2 cos(2x)', 'cos(2x)', '−2 cos(2x)', '2 sin(2x)'],
    correcta: 0,
  },
  {
    p: 'Si f(x) = (3x + 1)⁵, ¿qué regla aplicas primero?',
    ops: ['Regla del producto', 'Regla de la cadena', 'Regla del cociente', 'Derivada implícita'],
    correcta: 1,
  },
  {
    p: '¿Cuánto vale el límite de (x² − 4)/(x − 2) cuando x → 2?',
    ops: ['4', '0', 'No existe', '2'],
    correcta: 0,
  },
];

export const ALUMNOS = [
  { n: 'Camila Torres', i: 'CT', entregado: '26 sep', nota: 4.6, sinEntregar: false },
  { n: 'Andrés Ríos', i: 'AR', entregado: '26 sep', nota: null, sinEntregar: false },
  { n: 'Valentina Mora', i: 'VM', entregado: '27 sep', nota: null, sinEntregar: false },
  { n: 'Sebastián Gil', i: 'SG', entregado: '25 sep', nota: 5.0, sinEntregar: false },
  { n: 'Laura Pineda', i: 'LP', entregado: '—', nota: null, sinEntregar: true },
  { n: 'Mateo Cárdenas', i: 'MC', entregado: '27 sep', nota: 3.8, sinEntregar: false },
];

/** Miniaturas del laboratorio: el trazo es decorativo, no se calcula. */
export const GRAFICAS_GUARDADAS = [
  {
    fn: '(16−x²)/(4−x)',
    detalle: 'Límite en x = 4',
    trazo: 'M10 95 L190 20',
    punto: { cx: 118, cy: 50 },
  },
  {
    fn: 'sin(x)/x',
    detalle: 'Límite en x = 0',
    trazo: 'M10 62 C 30 50, 45 78, 62 66 S 85 20, 100 20 S 125 56, 138 66 S 170 50, 190 60',
    punto: null,
  },
  {
    fn: 'x³ − 3x',
    detalle: 'Derivada y recta tangente',
    trazo: 'M14 100 C 40 10, 70 20, 100 55 S 160 100, 186 10',
    tangente: 'M40 40 L110 40',
    punto: null,
  },
];

export const VIDEOS_ESPACIO = [
  { titulo: 'Regla de la cadena', detalle: 'Derivadas · 14 min', vistoPor: '18 de 24 lo vieron' },
  { titulo: 'Derivadas implícitas', detalle: 'Derivadas · 18 min', vistoPor: '12 de 24 lo vieron' },
  { titulo: 'Derivada de un cociente', detalle: 'Derivadas · 9 min', vistoPor: '21 de 24 lo vieron' },
];

export const SUGERENCIAS_TUTOR = {
  estudiante: ['¿Por qué 0/0 no es 0?', 'Límites laterales con valor absoluto', 'Cómo factorizar x² − 16'],
  maestro: ['Genera 5 ejercicios de regla de la cadena', 'Explica L’Hôpital para la clase', 'Ideas para evaluar continuidad'],
};

export const ETIQUETA_ESTADO = {
  pendiente: 'Por hacer',
  entregado: 'Entregado · sin calificar',
  calificado: 'Calificado',
};
