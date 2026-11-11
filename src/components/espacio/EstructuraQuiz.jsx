import { useEffect, useState } from 'react';
import { api } from '../../services/api';

const LETRAS = 'ABCDE';

const fechaCorta = (fecha) =>
  fecha
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(fecha))
    : 'Sin fecha límite';

/**
 * Preguntas de un quiz en solo lectura. `correcta(i)` marca la opción correcta
 * y `elegida(i)` la que marcó el estudiante; sin ellas, solo muestra el texto.
 */
export function PreguntasQuiz({ preguntas, correcta, elegida }) {
  return (
    <ol className="quiz-preguntas">
      {preguntas.map((pregunta, i) => {
        const buena = correcta?.(i);
        const marcada = elegida?.(i);

        return (
          <li key={pregunta.id ?? pregunta._id ?? pregunta.preguntaId ?? i} className="quiz-pregunta">
            <p className="quiz-enunciado">
              <span className="quiz-numero">Pregunta {i + 1}</span>
              {pregunta.enunciado || <em className="suave-txt">Sin enunciado</em>}
            </p>

            <ul className="quiz-opciones">
              {pregunta.opciones.map((opcion, j) => {
                const esCorrecta = buena === j;
                const esElegida = marcada === j;

                return (
                  <li
                    key={j}
                    className="quiz-opcion"
                    data-correcta={esCorrecta || undefined}
                    data-error={(esElegida && !esCorrecta) || undefined}
                  >
                    <span className="quiz-letra" aria-hidden="true">{LETRAS[j]}</span>
                    <span>{opcion || <em className="suave-txt">Opción vacía</em>}</span>
                    {esCorrecta && <span className="quiz-marca">{esElegida ? 'Correcta · tu respuesta' : 'Correcta'}</span>}
                    {esElegida && !esCorrecta && <span className="quiz-marca">Tu respuesta</span>}
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}

/** Estructura de un quiz del docente: datos y preguntas con la correcta (spec-docente RF-05b). */
export function EstructuraQuizDocente({ id }) {
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let vigente = true;

    api(`/evaluaciones/docente/${id}`)
      .then((datos) => {
        if (vigente) setQuiz(datos.evaluacion);
      })
      .catch((err) => {
        if (vigente) setError(err.message);
      });

    return () => {
      vigente = false;
    };
  }, [id]);

  if (error) {
    return <div className="aviso-caja" role="alert">No se pudo cargar la estructura del quiz. {error}</div>;
  }

  if (!quiz) {
    return <div className="sesion-espera" role="status">Cargando las preguntas...</div>;
  }

  return (
    <div className="tarjeta">
      <div className="cabeza-fila">
        <h2>Estructura del quiz</h2>
        <span className="estado" data-e={quiz.estado === 'publicado' ? 'calificado' : 'pendiente'}>
          {quiz.estado === 'publicado' ? 'Publicado' : 'Borrador'}
        </span>
      </div>

      <p className="suave-txt">
        {quiz.preguntas.length} {quiz.preguntas.length === 1 ? 'pregunta' : 'preguntas'} · Cierra: {fechaCorta(quiz.fechaLimite)}
      </p>
      <p className="suave-txt">Así lo ve el estudiante, sin la marca de la respuesta correcta.</p>

      {quiz.preguntas.length === 0 ? (
        <div className="aviso-caja">Este quiz todavía no tiene preguntas.</div>
      ) : (
        <PreguntasQuiz preguntas={quiz.preguntas} correcta={(i) => quiz.preguntas[i].respuestaCorrecta} />
      )}
    </div>
  );
}
