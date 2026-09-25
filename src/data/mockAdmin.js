/**
 * Datos de ejemplo del panel de administrador.
 * Maqueta estática: nada de esto se guarda todavía.
 */

export const MODULOS = [
  {
    id: 'calc1',
    nombre: 'Cálculo I',
    descripcion: 'Fundamentos del cálculo diferencial: límites, asíntotas y comportamiento de las funciones.',
    estado: 'activo',
    lecciones: 31,
    actualizado: 'hace 2 horas',
  },
  {
    id: 'precalculo',
    nombre: 'Precálculo (nivelación)',
    descripcion: 'Repaso de funciones, álgebra y trigonometría para llegar preparado.',
    estado: 'borrador',
    lecciones: 0,
    actualizado: 'hace 6 días',
  },
  {
    id: 'calc2',
    nombre: 'Cálculo II',
    descripcion: 'Integrales, técnicas de integración y series.',
    estado: 'inactivo',
    lecciones: 0,
    actualizado: 'hace 12 días',
  },
];

export const LECCIONES = [
  { id: 'l1', num: '1.1', titulo: 'Introducción – Definición de límite', unidad: 'Límites', estado: 'publicada', actualizado: 'hace 25 min' },
  { id: 'l2', num: '1.2', titulo: 'Límites laterales', unidad: 'Límites', estado: 'publicada', actualizado: 'hace 3 horas' },
  { id: 'l3', num: '1.5', titulo: 'Asíntotas verticales, horizontales y oblicuas', unidad: 'Límites', estado: 'publicada', actualizado: 'ayer' },
  { id: 'l4', num: '1.9', titulo: 'Discontinuidad removible y esencial', unidad: 'Límites', estado: 'borrador', actualizado: 'hace 2 días' },
  { id: 'l5', num: '2.4', titulo: 'Regla de la cadena', unidad: 'Derivadas', estado: 'publicada', actualizado: 'hace 4 días' },
  { id: 'l6', num: '3.6', titulo: 'Optimización', unidad: 'Aplicaciones', estado: 'oculta', actualizado: 'hace 9 días' },
];

export const RECURSOS = [
  { id: 'r1', nombre: 'Contenido', descripcion: 'Texto, fórmulas, imágenes, videos y ejemplos de cada lección.', piezas: 31, visible: true },
  { id: 'r2', nombre: 'Videos', descripcion: 'Clases cortas que refuerzan cada tema.', piezas: 22, visible: true },
  { id: 'r3', nombre: 'Laboratorio', descripcion: 'Simulador para explorar límites y derivadas moviendo el punto.', piezas: 1, visible: true },
  { id: 'r4', nombre: 'Videoteca', descripcion: 'Clases grabadas y material de apoyo en video.', piezas: 22, visible: true },
  { id: 'r5', nombre: 'Tutor IA', descripcion: 'Asistente que guía paso a paso sin dar la respuesta directa.', piezas: 3, visible: true },
  { id: 'r6', nombre: 'Conceptos previos', descripcion: 'Temas que conviene repasar antes de empezar.', piezas: 6, visible: false },
];

export const USUARIOS = [
  { id: 'u1', nombre: 'Camila Torres', correo: 'camila.torres@uni.edu', rol: 'Estudiante', progreso: 82, activo: true },
  { id: 'u2', nombre: 'Andrés Ríos', correo: 'andres.rios@uni.edu', rol: 'Estudiante', progreso: 64, activo: true },
  { id: 'u3', nombre: 'Valentina Mora', correo: 'valentina.mora@uni.edu', rol: 'Estudiante', progreso: 47, activo: true },
  { id: 'u4', nombre: 'Sebastián Gil', correo: 'sebastian.gil@uni.edu', rol: 'Estudiante', progreso: 100, activo: true },
  { id: 'u5', nombre: 'Laura Pineda', correo: 'laura.pineda@uni.edu', rol: 'Estudiante', progreso: 23, activo: false },
  { id: 'u6', nombre: 'Andrés Ruiz', correo: 'andres.ruiz@uni.edu', rol: 'Maestro', progreso: null, activo: true },
  { id: 'u7', nombre: 'Marta Rojas', correo: 'marta.rojas@uni.edu', rol: 'Maestro', progreso: null, activo: true },
  { id: 'u8', nombre: 'Administrador', correo: 'admin@educalc.xe', rol: 'Administrador', progreso: null, activo: true },
];

export const RECIENTES = [
  { tipo: 'Lección', titulo: '1.1 Introducción – Definición de límite', cuando: 'hace 25 min', estado: 'publicada' },
  { tipo: 'Recurso', titulo: 'Videos de la unidad de límites', cuando: 'hace 4 horas', estado: 'publicada' },
  { tipo: 'Lección', titulo: '1.9 Discontinuidad removible y esencial', cuando: 'hace 2 días', estado: 'borrador' },
  { tipo: 'Módulo', titulo: 'Cálculo I', cuando: 'hace 2 días', estado: 'publicada' },
  { tipo: 'Recurso', titulo: 'Conceptos previos', cuando: 'hace 4 días', estado: 'oculta' },
];

export const PASTILLA_ESTADO = {
  publicada: ['pastilla-ok', 'Publicada'],
  borrador: ['pastilla-borrador', 'Borrador'],
  oculta: ['pastilla-off', 'Oculta'],
  activo: ['pastilla-ok', 'Activo'],
  inactivo: ['pastilla-off', 'Inactivo'],
};
