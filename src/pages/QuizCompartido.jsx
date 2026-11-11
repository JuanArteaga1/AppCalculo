
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

function QuizCompartido() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evaluacion, setEvaluacion] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [resultado, setResultado] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const cargarQuiz = async () => {
      try {
        setCargando(true);
        setError('');

        const respuesta = await api(
          `/evaluaciones/estudiante/${id}`
        );

        setEvaluacion(respuesta.evaluacion);
      } catch (err) {
        setError(err.message || 'No fue posible cargar el quiz.');
      } finally {
        setCargando(false);
      }
    };

    cargarQuiz();
  }, [id]);

  const seleccionarRespuesta = (preguntaId, opcionSeleccionada) => {
    setRespuestas((actuales) => ({
      ...actuales,
      [preguntaId]: opcionSeleccionada
    }));
  };

  const enviarRespuestas = async () => {
    setError('');
    setMensaje('');

    if (!evaluacion) return;

    const preguntasSinResponder = evaluacion.preguntas.filter(
      (pregunta) => respuestas[pregunta.id] === undefined
    );

    if (preguntasSinResponder.length > 0) {
      setError('Responde todas las preguntas antes de enviar el quiz.');
      return;
    }

    const cuerpo = {
      respuestas: evaluacion.preguntas.map((pregunta) => ({
        preguntaId: pregunta.id,
        opcionSeleccionada: respuestas[pregunta.id]
      }))
    };

    try {
      setEnviando(true);

      const respuesta = await api(
        `/evaluaciones/estudiante/${id}/respuestas`,
        {
          metodo: 'POST',
          cuerpo
        }
      );

      setResultado(respuesta.resultado);
      setMensaje(respuesta.mensaje || 'Respuestas enviadas correctamente.');
    } catch (err) {
      setError(err.message || 'No fue posible enviar tus respuestas.');
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <section className="panel">
        <p>Cargando quiz...</p>
      </section>
    );
  }

  if (error && !evaluacion) {
    return (
      <section className="panel">
        <div className="panel-cabeza">
          <h1>No se pudo abrir el quiz</h1>
        </div>

        <div className="aviso-caja" role="alert">
          {error}
        </div>

        <button
          type="button"
          className="pnl-btn pnl-btn-secundario"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </section>
    );
  }

  if (!evaluacion) return null;

  if (resultado) {
    return (
      <section className="panel">
        <div className="panel-cabeza">
          <h1>Quiz completado</h1>
          <p>{evaluacion.titulo}</p>
        </div>

        <div className="tarjeta">
          <h2>Tu resultado</h2>

          <p>
            <strong>Nota obtenida:</strong> {Number(resultado.nota).toFixed(1)} / 5.0
          </p>

          <p>
            <strong>Respuestas correctas:</strong> {resultado.aciertos} de{' '}
            {resultado.totalPreguntas}
          </p>

          {resultado.fechaRespuesta && (
            <p>
              <strong>Fecha de entrega:</strong>{' '}
              {new Date(resultado.fechaRespuesta).toLocaleString('es-CO')}
            </p>
          )}
        </div>

        <div className="aviso-caja" role="status">
          {mensaje}
          <p>
            Las respuestas correctas estarán disponibles cuando finalice
            el plazo del quiz.
          </p>
        </div>

        <button
          type="button"
          className="pnl-btn pnl-btn-primario"
          onClick={() => navigate('/espacio/estudiante/progreso')}
        >
          Volver a mi espacio
        </button>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>{evaluacion.titulo}</h1>

        <p>
          <strong>Módulo:</strong>{' '}
          {evaluacion.modulo?.titulo || 'Sin módulo'}
        </p>

        {evaluacion.temas?.length > 0 && (
          <p>
            <strong>{evaluacion.temas.length === 1 ? 'Tema:' : 'Temas:'}</strong>{' '}
            {evaluacion.temas.map((t) => t.titulo).join(', ')}
          </p>
        )}

        <p>
          <strong>Fecha límite:</strong>{' '}
          {evaluacion.fechaLimite
            ? new Date(evaluacion.fechaLimite).toLocaleString('es-CO')
            : 'No especificada'}
        </p>

        <p className="suave-txt">
          Selecciona una respuesta para cada pregunta. Solo puedes enviar
          este quiz una vez.
        </p>
      </div>

      {error && (
        <div className="aviso-caja" role="alert">
          {error}
        </div>
      )}

      {evaluacion.preguntas.map((pregunta, indice) => (
        <div className="tarjeta" key={pregunta.id}>
          <h3>
            Pregunta {indice + 1}
          </h3>

          <p>{pregunta.enunciado}</p>

          <div>
            {pregunta.opciones.map((opcion, indiceOpcion) => (
              <label
                key={indiceOpcion}
                className="fila-botones"
              >
                <input
                  type="radio"
                  name={`pregunta-${pregunta.id}`}
                  value={indiceOpcion}
                  checked={respuestas[pregunta.id] === indiceOpcion}
                  onChange={() =>
                    seleccionarRespuesta(pregunta.id, indiceOpcion)
                  }
                  disabled={enviando}
                />

                <span>{opcion}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div className="fila-botones">
        <button
          type="button"
          className="pnl-btn pnl-btn-secundario"
          onClick={() => navigate(-1)}
          disabled={enviando}
        >
          Volver
        </button>

        <button
          type="button"
          className="pnl-btn pnl-btn-primario"
          onClick={enviarRespuestas}
          disabled={enviando}
        >
          {enviando ? 'Enviando...' : 'Enviar respuestas'}
        </button>
      </div>
    </section>
  );
}

export default QuizCompartido;
