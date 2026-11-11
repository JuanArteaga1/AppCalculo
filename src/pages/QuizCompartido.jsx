import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PreguntasQuiz } from '../components/espacio/EstructuraQuiz';
import { alerta, alertaError } from '../services/alertas';
import { api } from '../services/api';

const VOLVER = '/espacio/estudiante/aprender';

const fechaLarga = (fecha) =>
  fecha
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(fecha))
    : 'Sin fecha';

// Lo marcado se guarda en el navegador por si se cierra la pestaña (spec-estudiante BR-02, CA-10).
const claveGuardado = (id) => `educalc-quiz-${id}`;

function leerGuardado(id) {
  try {
    const guardado = JSON.parse(localStorage.getItem(claveGuardado(id)) ?? '{}');
    return guardado && typeof guardado === 'object' ? guardado : {};
  } catch {
    return {};
  }
}

function guardar(id, respuestas) {
  try {
    localStorage.setItem(claveGuardado(id), JSON.stringify(respuestas));
  } catch {
    // Sin almacenamiento (modo privado): se sigue respondiendo, solo no se conserva.
  }
}

function olvidar(id) {
  try {
    localStorage.removeItem(claveGuardado(id));
  } catch {
    // Nada que borrar.
  }
}

/**
 * Responder un quiz desde el enlace o el QR (spec-estudiante tarea D):
 * una sola vez, con todas las preguntas, y las correctas al vencer.
 */
export default function QuizCompartido() {
  const { id } = useParams();

  const [vista, setVista] = useState('cargando');
  const [quiz, setQuiz] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [respuestas, setRespuestas] = useState(() => leerGuardado(id));
  const [faltantes, setFaltantes] = useState([]);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const datos = await api(`/evaluaciones/estudiante/${id}`);
        if (!vigente) return;
        setQuiz(datos.evaluacion);
        setVista('responder');
      } catch (error) {
        if (!vigente) return;

        // Ya respondido: se muestra su resultado.
        if (error.codigo === 'QUIZ_YA_RESPONDIDO') {
          try {
            const datos = await api(`/evaluaciones/estudiante/${id}/resultado`);
            if (!vigente) return;
            setQuiz(datos.evaluacion);
            setResultado(datos.resultado);
            setVista('resultado');
            return;
          } catch (otro) {
            if (!vigente) return;
            setMotivo(otro.message);
          }
        } else {
          setMotivo(error.message);
        }

        setVista('error');
      }
    }

    cargar();

    return () => {
      vigente = false;
    };
  }, [id]);

  const marcar = (preguntaId, opcion) => {
    setRespuestas((actuales) => {
      const nuevas = { ...actuales, [preguntaId]: opcion };
      guardar(id, nuevas);
      return nuevas;
    });
    setFaltantes((actuales) => actuales.filter((faltante) => faltante !== preguntaId));
  };

  const enviar = async (e) => {
    e.preventDefault();

    // CA-09: todas son obligatorias; se dice cuáles faltan.
    const sinResponder = quiz.preguntas.filter((p) => !Number.isInteger(respuestas[p.id]));

    if (sinResponder.length > 0) {
      setFaltantes(sinResponder.map((p) => p.id));
      const numeros = sinResponder.map((p) => quiz.preguntas.indexOf(p) + 1);
      alerta.aviso(
        sinResponder.length === 1 ? 'Te falta una pregunta' : `Te faltan ${sinResponder.length} preguntas`,
        `Responde ${numeros.length === 1 ? 'la pregunta' : 'las preguntas'} ${numeros.join(', ')} para poder enviar.`
      );
      document.getElementById(`pregunta-${sinResponder[0].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setEnviando(true);

    try {
      const datos = await api(`/evaluaciones/estudiante/${id}/respuestas`, {
        metodo: 'POST',
        cuerpo: {
          respuestas: quiz.preguntas.map((p) => ({ preguntaId: p.id, opcionSeleccionada: respuestas[p.id] })),
        },
      });

      olvidar(id);
      setResultado(datos.resultado);
      setVista('resultado');
      alerta.ok('Quiz enviado', `Tu nota es ${Number(datos.resultado.nota).toFixed(1)} de 5.0.`);
    } catch (error) {
      alertaError('No se pudo enviar el quiz', error);
    } finally {
      setEnviando(false);
    }
  };

  if (vista === 'cargando') {
    return (
      <section className="panel quiz-pagina">
        <div className="sesion-espera" role="status">Abriendo el quiz...</div>
      </section>
    );
  }

  if (vista === 'error') {
    return (
      <section className="panel quiz-pagina">
        <div className="panel-cabeza">
          <h1>No puedes responder este quiz</h1>
          <p>{motivo}</p>
        </div>
        <Link className="boton-volver" to={VOLVER}>← Volver a mis quices</Link>
      </section>
    );
  }

  if (vista === 'resultado') {
    const revision = resultado.revision;

    return (
      <section className="panel quiz-pagina">
        <Link className="boton-volver" to={VOLVER}>← Volver a mis quices</Link>

        <div className="panel-cabeza">
          <h1>{quiz.titulo}</h1>
          <p>Ya respondiste este quiz.</p>
        </div>

        <div className="fila-3">
          <div className="tarjeta">
            <span className="mini-label">Tu nota</span>
            <span className="mini-num">{Number(resultado.nota).toFixed(1)} <small>/ 5.0</small></span>
          </div>
          <div className="tarjeta">
            <span className="mini-label">Correctas</span>
            <span className="mini-num">{resultado.aciertos} <small>de {resultado.totalPreguntas}</small></span>
          </div>
          <div className="tarjeta">
            <span className="mini-label">Enviado</span>
            <span className="quiz-fecha">{fechaLarga(resultado.fechaRespuesta)}</span>
          </div>
        </div>

        {revision ? (
          <div className="tarjeta">
            <h2>Revisión</h2>
            <p className="suave-txt">El quiz ya cerró: así eran las respuestas correctas.</p>
            <PreguntasQuiz
              preguntas={revision}
              correcta={(i) => revision[i].respuestaCorrecta}
              elegida={(i) => revision[i].opcionSeleccionada}
            />
          </div>
        ) : (
          <div className="aviso-caja" role="status">
            Las respuestas correctas se muestran cuando cierre el quiz.
            {quiz.fechaLimite && <> Cierra el <b>{fechaLarga(quiz.fechaLimite)}</b></>}
          </div>
        )}
      </section>
    );
  }

  const contestadas = quiz.preguntas.filter((p) => Number.isInteger(respuestas[p.id])).length;

  return (
    <section className="panel quiz-pagina">
      <Link className="boton-volver" to={VOLVER}>← Volver a mis quices</Link>

      <div className="panel-cabeza">
        <h1>{quiz.titulo}</h1>
        <p>
          {quiz.modulo?.titulo ?? 'Módulo'}
          {quiz.temas?.length > 0 && ` · ${quiz.temas.map((t) => t.titulo).join(', ')}`}
        </p>
      </div>

      <div className="aviso-caja">
        Cierra el <b>{fechaLarga(quiz.fechaLimite)}</b>.<br />
        Responde todas las preguntas; solo puedes enviarlo una vez.
        Lo que marques se guarda en este navegador si cierras la pestaña.
      </div>

      <form onSubmit={enviar} className="quiz-formulario">
        {quiz.preguntas.map((pregunta, i) => {
          const falta = faltantes.includes(pregunta.id);

          return (
            <fieldset
              key={pregunta.id}
              id={`pregunta-${pregunta.id}`}
              className="tarjeta quiz-pregunta"
              data-falta={falta || undefined}
              aria-invalid={falta || undefined}
            >
              <legend className="quiz-enunciado">
                <span className="quiz-numero">Pregunta {i + 1}</span>
                {pregunta.enunciado}
              </legend>

              {falta && <p className="campo-error">Falta responder esta pregunta.</p>}

              <div className="quiz-opciones">
                {pregunta.opciones.map((opcion, j) => (
                  <label key={j} className="quiz-opcion quiz-opcion-elegible" data-marcada={respuestas[pregunta.id] === j || undefined}>
                    <input
                      type="radio"
                      name={`pregunta-${pregunta.id}`}
                      checked={respuestas[pregunta.id] === j}
                      onChange={() => marcar(pregunta.id, j)}
                      disabled={enviando}
                    />
                    <span className="quiz-letra" aria-hidden="true">{'ABCDE'[j]}</span>
                    <span>{opcion}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}

        <div className="quiz-enviar">
          <span className="suave-txt">{contestadas} de {quiz.preguntas.length} respondidas</span>
          <button type="submit" className="pnl-btn pnl-btn-primario" disabled={enviando}>
            {enviando ? 'Enviando...' : 'Enviar respuestas'}
          </button>
        </div>
      </form>
    </section>
  );
}
