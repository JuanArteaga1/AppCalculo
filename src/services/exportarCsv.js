/**
 * Exporta una tabla a un archivo que Excel abre directo (CSV en UTF-8 con BOM).
 * Usa punto y coma y coma decimal, como Excel en español (Colombia); así las
 * columnas y las notas quedan bien sin pasar por "Texto en columnas".
 */

const SEPARADOR = ';';

/** Nota con coma decimal: 4.25 → "4,3". */
export const numeroExcel = (valor, decimales = 1) =>
  Number.isFinite(Number(valor)) ? Number(valor).toFixed(decimales).replace('.', ',') : '';

function celda(valor) {
  let texto = valor === null || valor === undefined ? '' : String(valor);

  // Una celda que empieza con = + - @ Excel la ejecuta como fórmula: se neutraliza.
  if (/^[=+\-@\t\r]/.test(texto)) texto = `'${texto}`;

  return /[";\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

/** Arma el texto del archivo. `filas` es una lista de listas (la primera, los encabezados). */
export function tablaCsv(filas) {
  return filas.map((fila) => fila.map(celda).join(SEPARADOR)).join('\r\n');
}

/** Descarga la tabla como `nombre.csv`. */
export function descargarCsv(nombre, filas) {
  const blob = new Blob(['﻿', tablaCsv(filas)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');

  enlace.href = url;
  enlace.download = `${nombre}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Nombre de archivo seguro a partir de un título: "Quiz 1: Límites" → "quiz-1-limites". */
export const nombreArchivo = (titulo) =>
  String(titulo ?? 'resultados')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'resultados';

const fechaExcel = (fecha) =>
  fecha
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(fecha))
    : '';

/**
 * Descarga las notas de un quiz: una fila por estudiante y, al final, el promedio.
 * `notas` es la lista de `GET /evaluaciones/{docente|administrador}/:id/notas`.
 */
export function exportarNotasQuiz(titulo, notas) {
  const filas = [
    ['Estudiante', 'Correo', 'Fecha de entrega', 'Correctas', 'Preguntas', 'Nota (0 a 5)'],
    ...notas.map((n) => [
      n.estudiante?.nombre ?? 'Estudiante no disponible',
      n.estudiante?.correo ?? '',
      fechaExcel(n.fechaRespuesta),
      n.aciertos,
      n.totalPreguntas,
      numeroExcel(n.nota),
    ]),
  ];

  if (notas.length) {
    const promedio = notas.reduce((s, n) => s + Number(n.nota || 0), 0) / notas.length;
    filas.push([], ['Promedio del quiz', '', '', '', '', numeroExcel(promedio)]);
  }

  descargarCsv(`notas-${nombreArchivo(titulo)}`, filas);
}
