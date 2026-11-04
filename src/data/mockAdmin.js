/**
 * Datos de ejemplo del panel de administrador.
 * Maqueta estática: los docentes y lo que crean aún no vienen del backend (EG-061).
 */

export const DOCENTES = [
  {
    id: 'd1',
    nombre: 'Andrés Ruiz',
    correo: 'andres.ruiz@uniautonoma.edu.co',
    modulos: ['limites', 'derivadas'],
    estado: 'activo',
    acceso: 'hoy',
  },
  {
    id: 'd2',
    nombre: 'Marta Rojas',
    correo: 'marta.rojas@uniautonoma.edu.co',
    modulos: ['limites'],
    estado: 'activo',
    acceso: 'ayer',
  },
  {
    id: 'd3',
    nombre: 'Paula Cifuentes',
    correo: 'paula.cifuentes@uniautonoma.edu.co',
    modulos: ['aplicaciones'],
    estado: 'activo',
    acceso: 'hace 4 días',
  },
  {
    id: 'd4',
    nombre: 'Hernán Muñoz',
    correo: 'hernan.munoz@uniautonoma.edu.co',
    modulos: ['derivadas'],
    estado: 'pendiente',
    acceso: 'sin ingreso',
  },
];

/** Todo lo que crearon los docentes, del más reciente al más antiguo. */
export const CREACIONES = [
  { id: 'c01', tipo: 'Quiz', titulo: 'Regla de la cadena en funciones compuestas', modulo: 'derivadas', tema: '2.4', docente: 'd1', estado: 'publicada', creado: '29 oct', preguntas: 6, entregas: 11, total: 24, promedio: 3.6 },
  { id: 'c02', tipo: 'Lección', titulo: 'Razones de cambio con ejemplos de ingeniería', modulo: 'aplicaciones', tema: '3.1', docente: 'd3', estado: 'borrador', creado: '27 oct', preguntas: null, entregas: null, total: null, promedio: null },
  { id: 'c03', tipo: 'Examen', titulo: 'Parcial de derivadas', modulo: 'derivadas', tema: '2.3', docente: 'd1', estado: 'borrador', creado: '26 oct', preguntas: 12, entregas: 0, total: 24, promedio: null },
  { id: 'c04', tipo: 'Quiz', titulo: 'Máximos y mínimos relativos', modulo: 'aplicaciones', tema: '3.3', docente: 'd3', estado: 'publicada', creado: '22 oct', preguntas: 5, entregas: 17, total: 21, promedio: 3.9 },
  { id: 'c05', tipo: 'Lección', titulo: 'Continuidad explicada con gráficas', modulo: 'limites', tema: '1.7', docente: 'd2', estado: 'publicada', creado: '19 oct', preguntas: null, entregas: null, total: null, promedio: null },
  { id: 'c06', tipo: 'Quiz', titulo: 'Límites al infinito', modulo: 'limites', tema: '1.4', docente: 'd2', estado: 'publicada', creado: '14 oct', preguntas: 5, entregas: 22, total: 24, promedio: 4.1 },
  { id: 'c07', tipo: 'Lección', titulo: 'Derivación implícita paso a paso', modulo: 'derivadas', tema: '2.8', docente: 'd1', estado: 'publicada', creado: '9 oct', preguntas: null, entregas: null, total: null, promedio: null },
  { id: 'c08', tipo: 'Examen', titulo: 'Parcial de límites y continuidad', modulo: 'limites', tema: '1.8', docente: 'd2', estado: 'publicada', creado: '2 oct', preguntas: 10, entregas: 24, total: 24, promedio: 3.7 },
  { id: 'c09', tipo: 'Lección', titulo: 'Asíntotas en funciones racionales', modulo: 'limites', tema: '1.5', docente: 'd1', estado: 'publicada', creado: '25 sep', preguntas: null, entregas: null, total: null, promedio: null },
  { id: 'c10', tipo: 'Quiz', titulo: 'Límites laterales', modulo: 'limites', tema: '1.2', docente: 'd1', estado: 'publicada', creado: '18 sep', preguntas: 4, entregas: 23, total: 24, promedio: 4.3 },
  { id: 'c11', tipo: 'Lección', titulo: 'Interpretación geométrica de la derivada', modulo: 'derivadas', tema: '2.2', docente: 'd1', estado: 'publicada', creado: '11 sep', preguntas: null, entregas: null, total: null, promedio: null },
  { id: 'c12', tipo: 'Lección', titulo: 'Qué significa acercarse a un punto', modulo: 'limites', tema: '1.1', docente: 'd2', estado: 'publicada', creado: '4 sep', preguntas: null, entregas: null, total: null, promedio: null },
  { id: 'c13', tipo: 'Examen', titulo: 'Diagnóstico de conceptos previos', modulo: 'limites', tema: '1.1', docente: 'd2', estado: 'oculta', creado: '1 sep', preguntas: 15, entregas: 21, total: 24, promedio: 3.2 },
];

export const RECURSOS = [
  { id: 'r1', nombre: 'Contenido', descripcion: 'Texto, fórmulas, imágenes, videos y ejemplos de cada lección.', piezas: 31, visible: true },
  { id: 'r2', nombre: 'Videos', descripcion: 'Clases cortas que refuerzan cada tema.', piezas: 22, visible: true },
  { id: 'r3', nombre: 'Laboratorio', descripcion: 'Simulador para explorar límites y derivadas moviendo el punto.', piezas: 1, visible: true },
  { id: 'r4', nombre: 'Videoteca', descripcion: 'Clases grabadas y material de apoyo en video.', piezas: 22, visible: true },
  { id: 'r5', nombre: 'Tutor IA', descripcion: 'Asistente que guía paso a paso sin dar la respuesta directa.', piezas: 3, visible: true },
  { id: 'r6', nombre: 'Conceptos previos', descripcion: 'Temas que conviene repasar antes de empezar.', piezas: 6, visible: false },
];

export const PASTILLA_ESTADO = {
  publicada: ['pastilla-ok', 'Publicada'],
  borrador: ['pastilla-borrador', 'Borrador'],
  oculta: ['pastilla-off', 'Oculta'],
  activo: ['pastilla-ok', 'Activo'],
  inactivo: ['pastilla-off', 'Inactivo'],
  pendiente: ['pastilla-borrador', 'Invitación pendiente'],
};
