/**
 * Fichas del grupo 03 que ve el maestro para seguir el avance de cada estudiante.
 * Maqueta estática: el progreso por unidad alimenta los anillos del perfil y el
 * general es el promedio de las tres unidades.
 */

export const ESTUDIANTES = [
  {
    id: 'a1',
    nombre: 'Camila Torres',
    iniciales: 'CT',
    correo: 'camila.torres@uni.edu',
    unidades: { limites: 100, derivadas: 80, aplicaciones: 58 },
    promedio: 4.6,
    entregas: '4 de 4',
    ultimoAcceso: 'hace 2 horas',
    videos: '19 de 22',
    temas: '25 de 31',
    seguimiento: 'al-dia',
    notas: [
      { titulo: 'Taller 3 · Regla de la cadena', tipo: 'Taller', nota: 4.8, estado: 'calificado' },
      { titulo: 'Quiz 2 · Límites al infinito', tipo: 'Quiz', nota: 4.5, estado: 'calificado' },
      { titulo: 'Evaluación Unidad 1', tipo: 'Evaluación', nota: 4.7, estado: 'calificado' },
      { titulo: 'Taller 2 · Continuidad', tipo: 'Taller', nota: 4.4, estado: 'calificado' },
    ],
  },
  {
    id: 'a2',
    nombre: 'Andrés Ríos',
    iniciales: 'AR',
    correo: 'andres.rios@uni.edu',
    unidades: { limites: 89, derivadas: 50, aplicaciones: 25 },
    promedio: 3.9,
    entregas: '3 de 4',
    ultimoAcceso: 'ayer',
    videos: '12 de 22',
    temas: '17 de 31',
    seguimiento: 'al-dia',
    notas: [
      { titulo: 'Taller 3 · Regla de la cadena', tipo: 'Taller', nota: null, estado: 'entregado' },
      { titulo: 'Quiz 2 · Límites al infinito', tipo: 'Quiz', nota: 3.6, estado: 'calificado' },
      { titulo: 'Evaluación Unidad 1', tipo: 'Evaluación', nota: 4.1, estado: 'calificado' },
      { titulo: 'Taller 2 · Continuidad', tipo: 'Taller', nota: 4.0, estado: 'calificado' },
    ],
  },
  {
    id: 'a3',
    nombre: 'Valentina Mora',
    iniciales: 'VM',
    correo: 'valentina.mora@uni.edu',
    unidades: { limites: 78, derivadas: 40, aplicaciones: 17 },
    promedio: 3.4,
    entregas: '3 de 4',
    ultimoAcceso: 'hace 3 días',
    videos: '9 de 22',
    temas: '13 de 31',
    seguimiento: 'atrasado',
    notas: [
      { titulo: 'Taller 3 · Regla de la cadena', tipo: 'Taller', nota: null, estado: 'entregado' },
      { titulo: 'Quiz 2 · Límites al infinito', tipo: 'Quiz', nota: 3.0, estado: 'calificado' },
      { titulo: 'Evaluación Unidad 1', tipo: 'Evaluación', nota: 3.5, estado: 'calificado' },
      { titulo: 'Taller 2 · Continuidad', tipo: 'Taller', nota: 3.7, estado: 'calificado' },
    ],
  },
  {
    id: 'a4',
    nombre: 'Sebastián Gil',
    iniciales: 'SG',
    correo: 'sebastian.gil@uni.edu',
    unidades: { limites: 100, derivadas: 100, aplicaciones: 83 },
    promedio: 5.0,
    entregas: '4 de 4',
    ultimoAcceso: 'hace 40 minutos',
    videos: '22 de 22',
    temas: '29 de 31',
    seguimiento: 'al-dia',
    notas: [
      { titulo: 'Taller 3 · Regla de la cadena', tipo: 'Taller', nota: 5.0, estado: 'calificado' },
      { titulo: 'Quiz 2 · Límites al infinito', tipo: 'Quiz', nota: 5.0, estado: 'calificado' },
      { titulo: 'Evaluación Unidad 1', tipo: 'Evaluación', nota: 4.9, estado: 'calificado' },
      { titulo: 'Taller 2 · Continuidad', tipo: 'Taller', nota: 5.0, estado: 'calificado' },
    ],
  },
  {
    id: 'a5',
    nombre: 'Laura Pineda',
    iniciales: 'LP',
    correo: 'laura.pineda@uni.edu',
    unidades: { limites: 33, derivadas: 10, aplicaciones: 0 },
    promedio: 2.4,
    entregas: '1 de 4',
    ultimoAcceso: 'hace 3 semanas',
    videos: '3 de 22',
    temas: '5 de 31',
    seguimiento: 'en-riesgo',
    notas: [
      { titulo: 'Taller 3 · Regla de la cadena', tipo: 'Taller', nota: null, estado: 'pendiente' },
      { titulo: 'Quiz 2 · Límites al infinito', tipo: 'Quiz', nota: null, estado: 'pendiente' },
      { titulo: 'Evaluación Unidad 1', tipo: 'Evaluación', nota: 2.4, estado: 'calificado' },
      { titulo: 'Taller 2 · Continuidad', tipo: 'Taller', nota: null, estado: 'pendiente' },
    ],
  },
  {
    id: 'a6',
    nombre: 'Mateo Cárdenas',
    iniciales: 'MC',
    correo: 'mateo.cardenas@uni.edu',
    unidades: { limites: 67, derivadas: 30, aplicaciones: 8 },
    promedio: 3.8,
    entregas: '4 de 4',
    ultimoAcceso: 'hace 5 horas',
    videos: '11 de 22',
    temas: '11 de 31',
    seguimiento: 'al-dia',
    notas: [
      { titulo: 'Taller 3 · Regla de la cadena', tipo: 'Taller', nota: 3.8, estado: 'calificado' },
      { titulo: 'Quiz 2 · Límites al infinito', tipo: 'Quiz', nota: 3.5, estado: 'calificado' },
      { titulo: 'Evaluación Unidad 1', tipo: 'Evaluación', nota: 4.0, estado: 'calificado' },
      { titulo: 'Taller 2 · Continuidad', tipo: 'Taller', nota: 3.9, estado: 'calificado' },
    ],
  },
  {
    id: 'a7',
    nombre: 'Daniela Rueda',
    iniciales: 'DR',
    correo: 'daniela.rueda@uni.edu',
    unidades: { limites: 89, derivadas: 60, aplicaciones: 33 },
    promedio: 4.2,
    entregas: '4 de 4',
    ultimoAcceso: 'hace 1 día',
    videos: '16 de 22',
    temas: '20 de 31',
    seguimiento: 'al-dia',
    notas: [
      { titulo: 'Taller 3 · Regla de la cadena', tipo: 'Taller', nota: 4.3, estado: 'calificado' },
      { titulo: 'Quiz 2 · Límites al infinito', tipo: 'Quiz', nota: 4.0, estado: 'calificado' },
      { titulo: 'Evaluación Unidad 1', tipo: 'Evaluación', nota: 4.4, estado: 'calificado' },
      { titulo: 'Taller 2 · Continuidad', tipo: 'Taller', nota: 4.1, estado: 'calificado' },
    ],
  },
  {
    id: 'a8',
    nombre: 'Julián Ospina',
    iniciales: 'JO',
    correo: 'julian.ospina@uni.edu',
    unidades: { limites: 44, derivadas: 20, aplicaciones: 0 },
    promedio: 2.9,
    entregas: '2 de 4',
    ultimoAcceso: 'hace 9 días',
    videos: '6 de 22',
    temas: '8 de 31',
    seguimiento: 'en-riesgo',
    notas: [
      { titulo: 'Taller 3 · Regla de la cadena', tipo: 'Taller', nota: null, estado: 'pendiente' },
      { titulo: 'Quiz 2 · Límites al infinito', tipo: 'Quiz', nota: 2.6, estado: 'calificado' },
      { titulo: 'Evaluación Unidad 1', tipo: 'Evaluación', nota: 3.2, estado: 'calificado' },
      { titulo: 'Taller 2 · Continuidad', tipo: 'Taller', nota: null, estado: 'pendiente' },
    ],
  },
];

/** Cómo se lee cada estado de seguimiento y con qué punto de color. */
export const ETIQUETA_SEGUIMIENTO = {
  'al-dia': ['calificado', 'Al día'],
  atrasado: ['pendiente', 'Atrasado'],
  'en-riesgo': ['entregado', 'En riesgo'],
};

/** Unidades del curso en el orden en que se ven. */
export const UNIDADES = [
  ['limites', 'Límites'],
  ['derivadas', 'Derivadas'],
  ['aplicaciones', 'Aplicaciones'],
];

/** Progreso general: promedio de las tres unidades. */
export function progresoGeneral(estudiante) {
  const valores = UNIDADES.map(([clave]) => estudiante.unidades[clave]);
  return Math.round(valores.reduce((a, b) => a + b, 0) / valores.length);
}
