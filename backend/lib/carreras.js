// Lista cerrada de programas de la universidad (spec-login BR-11), entregada
// por el humano el 2026-11-10. Algunos nombres pueden ser denominaciones
// anteriores: se corrigen aquí cuando la universidad confirme la lista.

export const PREGRADOS = [
    "Administración de Empresas",
    "Contaduría Pública",
    "Derecho",
    "Entrenamiento Deportivo",
    "Finanzas y Negocios Internacionales",
    "Gobierno y Relaciones Internacionales",
    "Hotelería y Turismo",
    "Ingeniería Ambiental y de Saneamiento",
    "Ingeniería Civil",
    "Ingeniería Electrónica",
    "Ingeniería Energética",
    "Ingeniería de Sistemas Informáticos",
    "Ingeniería de Software y Computación",
    "Licenciatura en Educación Infantil",
    "Matemáticas Aplicadas en Ciencia de Datos",
];

export const ESPECIALIZACIONES = [
    "Especialización en Derecho de Familia",
    "Especialización en Derecho Penal",
    "Especialización en Edumática",
    "Especialización en Finanzas Corporativas",
    "Especialización en Gestión de Servicios de Tecnologías de Información",
    "Especialización en Gestión Integral del Riesgo de Desastres",
    "Especialización en Pedagogía",
    "Especialización en Promoción y Defensa de los Derechos Humanos",
    "Especialización en Proyectos de Desarrollo",
    "Especialización en Seguridad y Salud en el Trabajo",
];

const TODAS = new Set([...PREGRADOS, ...ESPECIALIZACIONES]);

export const esCarreraValida = (carrera) => typeof carrera === "string" && TODAS.has(carrera);
