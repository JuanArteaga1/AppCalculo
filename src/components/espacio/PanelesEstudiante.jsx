import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ALUMNOS,
  ETIQUETA_ESTADO,
  EVALUACIONES,
  PREGUNTAS,
  UNIDADES_PROGRESO,
} from '../../data/mockEspacio';
import { api } from '../../services/api';
import { useSesion } from '../../context/sesion';
import QRCode from 'qrcode';

/** Anillo de progreso: el trazo se calcula sobre la circunferencia r=37. */
export function Anillo({ pct }) {
  const circunferencia = 232.5;
  return (
    <div className="anillo-caja">
      <svg className="anillo" viewBox="0 0 84 84" aria-hidden="true">
        <circle className="pista" cx="42" cy="42" r="37" />
        <circle
          className="valor"
          cx="42"
          cy="42"
          r="37"
          strokeDasharray={`${(circunferencia * pct / 100).toFixed(1)} ${circunferencia}`}
        />
      </svg>
      <span>{pct}%</span>
    </div>
  );
}

export function PanelProgreso() {
  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Mi progreso</h1>
        <p>Así vas en Cálculo I. Cada unidad avanza a tu ritmo.</p>
      </div>

      <div className="tarjeta continuar">
        <div className="continuar-txt">
          <span className="mini-label">Continuar donde lo dejaste</span>
          <b>1.7 · Límites al infinito</b>
          <div className="pasos">
            <i className="on" /><i className="on" /><i className="on" /><i />
            <span>Paso 3 de 4</span>
          </div>
        </div>
        <Link className="pnl-btn pnl-btn-primario" to="/calculo1/limites/1.4">
          Continuar lección <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="fila-3">
        {UNIDADES_PROGRESO.map((u) => (
          <div key={u.nombre} className="tarjeta unidad-prog">
            <Anillo pct={u.pct} />
            <span className="unidad-nombre">{u.nombre}</span>
            <span className="suave-txt">{u.temas}</span>
            <div className="unidad-sig">
              Sigue con
              <b>{u.sigue}</b>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Lista de talleres y quices del estudiante, con el detalle de cada uno. */
export function PanelAprenderEstudiante() {
  const [detalle, setDetalle] = useState(null);

  if (detalle) {
    const evaluacion = EVALUACIONES.find((e) => e.id === detalle);
    return <DetalleEstudiante evaluacion={evaluacion} onVolver={() => setDetalle(null)} />;
  }

  const porHacer = EVALUACIONES.filter((e) => e.alumno.estado === 'pendiente').length;
  const esperando = EVALUACIONES.filter((e) => e.alumno.estado === 'entregado').length;
  const notas = EVALUACIONES.filter((e) => e.alumno.nota).map((e) => e.alumno.nota);
  const promedio = notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : '—';

  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Evalúate</h1>
        <p>Los talleres, quices y evaluaciones que tu maestro publicó para el curso.</p>
      </div>

      <div className="fila-3">
        <div className="tarjeta"><span className="mini-label">Por hacer</span><span className="mini-num">{porHacer}</span></div>
        <div className="tarjeta"><span className="mini-label">Esperando nota</span><span className="mini-num">{esperando}</span></div>
        <div className="tarjeta">
          <span className="mini-label">Promedio</span>
          <span className="mini-num">{promedio} <small>/ 5.0</small></span>
        </div>
      </div>

      <ul className="lista">
        {EVALUACIONES.map((e) => (
          <li key={e.id} className="item">
            <span className="item-icono">{e.tipo.slice(0, 1)}</span>
            <span className="item-txt">
              <b>{e.titulo}</b>
              <span>{e.tipo} · {e.unidad} · entrega {e.vence}</span>
            </span>
            {e.alumno.nota && <span className="nota-grande">{e.alumno.nota.toFixed(1)}</span>}
            <span className="estado" data-e={e.alumno.estado}>{ETIQUETA_ESTADO[e.alumno.estado]}</span>
            <button
              type="button"
              className={`pnl-btn pnl-btn-chico ${e.alumno.estado === 'pendiente' ? 'pnl-btn-primario' : 'pnl-btn-secundario'}`}
              onClick={() => setDetalle(e.id)}
            >
              {e.alumno.estado === 'pendiente' ? 'Hacer' : 'Ver'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function DetalleEstudiante({ evaluacion, onVolver }) {
  const [elegidas, setElegidas] = useState({});

  const cabeza = (
    <>
      <button type="button" className="boton-volver" onClick={onVolver}>← Volver a Evalúate</button>
      <div className="panel-cabeza">
        <h1>{evaluacion.titulo}</h1>
        <p>{evaluacion.tipo} · {evaluacion.unidad} · entrega {evaluacion.vence} · 3 preguntas</p>
      </div>
    </>
  );

  if (evaluacion.alumno.estado === 'calificado') {
    return (
      <section className="panel">
        {cabeza}
        <div className="tarjeta">
          <div className="cabeza-fila">
            <h2>Tu calificación</h2>
            <span className="nota-grande">{evaluacion.alumno.nota.toFixed(1)} / 5.0</span>
          </div>
          <p className="suave-txt">Comentario del maestro</p>
          <div className="respuesta-alumno">{evaluacion.alumno.comentario}</div>
        </div>
        <div className="tarjeta">
          <h2>Tus respuestas</h2>
          {PREGUNTAS.map((q, k) => (
            <div key={q.p} className="respuesta-alumno">
              <small>Pregunta {k + 1} · {q.p}</small>
              <b>{q.ops[k === 2 ? 0 : q.correcta]}</b>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (evaluacion.alumno.estado === 'entregado') {
    return (
      <section className="panel">
        {cabeza}
        <div className="aviso-caja">
          Ya enviaste este {evaluacion.tipo.toLowerCase()}. Tu maestro lo está revisando.
        </div>
        <div className="tarjeta">
          <h2>Tus respuestas</h2>
          {PREGUNTAS.map((q, k) => (
            <div key={q.p} className="respuesta-alumno">
              <small>Pregunta {k + 1} · {q.p}</small>
              <b>{q.ops[q.correcta]}</b>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      {cabeza}
      <form className="tarjeta" onSubmit={(e) => e.preventDefault()}>
        <h2>Responde las 3 preguntas</h2>
        {PREGUNTAS.map((q, k) => (
          <div key={q.p} className="pregunta">
            <b>{k + 1}. {q.p}</b>
            <div className="opciones">
              {q.ops.map((o, j) => (
                <label key={o} className={`opcion ${elegidas[k] === j ? 'elegida' : ''}`}>
                  <input
                    type="radio"
                    name={`q${k}`}
                    value={j}
                    checked={elegidas[k] === j}
                    onChange={() => setElegidas({ ...elegidas, [k]: j })}
                  />
                  {o}
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="calif-fila">
          <button className="pnl-btn pnl-btn-primario" type="submit">Enviar respuestas</button>
          <span className="suave-txt">Puedes enviarlo una sola vez.</span>
        </div>
      </form>
    </section>
  );
}

/** Vista del maestro: sus evaluaciones y quién ya entregó. */

export function PanelAprenderMaestro() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [mensaje, setMensaje] = useState('');
  const [detalle, setDetalle] = useState(null);

  const cargarEvaluaciones = useCallback(async () => {
    setEstado('cargando');
    setMensaje('');

    try {
      const datos = await api('/evaluaciones/docente');

      setEvaluaciones(datos.evaluaciones ?? []);
      setEstado('listo');
    } catch (error) {
      setMensaje(error.message);
      setEstado('error');
    }
  }, []);

  useEffect(() => {
    cargarEvaluaciones();
  }, [cargarEvaluaciones]);

  if (
    detalle === 'crear' ||
    (typeof detalle === 'string' && detalle.startsWith('editar:'))
  ) {
    const esEdicion = detalle.startsWith('editar:');
    const idEdicion = esEdicion ? detalle.slice(7) : null;

    const evaluacionBase = idEdicion
      ? evaluaciones.find((e) => e.id === idEdicion)
      : null;

    return (
      <FormularioQuizMaestro
        evaluacion={evaluacionBase}
        onVolver={() => {
          setDetalle(null);
          cargarEvaluaciones();
        }}
      />
    );
  }

  if (detalle) {
    const evaluacionSeleccionada = evaluaciones.find(
      (e) => e.id === detalle
    );

    return (
      <DetalleMaestro
        evaluacion={evaluacionSeleccionada}
        onVolver={() => setDetalle(null)}
      />
    );
  }

  const borradores = evaluaciones.filter(
    (e) => e.estado === 'borrador'
  ).length;

  const publicados = evaluaciones.filter(
    (e) => e.estado === 'publicado'
  ).length;

  const vencidos = evaluaciones.filter(
    (e) => e.vencido
  ).length;

  const fechaFormato = (fecha) => {
    if (!fecha) return 'Sin fecha límite';

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(fecha));
  };

  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Evalúate</h1>
        <p>
          Administra los quices que has creado para tus estudiantes.
        </p>
      </div>

      <div className="fila-3">
        <div className="tarjeta">
          <span className="mini-label">Quices creados</span>
          <span className="mini-num">{evaluaciones.length}</span>
        </div>

        <div className="tarjeta">
          <span className="mini-label">Borradores</span>
          <span className="mini-num">{borradores}</span>
        </div>

        <div className="tarjeta">
          <span className="mini-label">Publicados</span>
          <span className="mini-num">{publicados}</span>
        </div>
      </div>

      <div className="cabeza-fila">
        <div>
          <h2>Mis quices</h2>
          <p className="suave-txt">
            Quices asociados a los módulos que tienes asignados.
          </p>
        </div>

        <div className="fila-botones">
          <button
            type="button"
            className="pnl-btn pnl-btn-secundario pnl-btn-chico"
            onClick={cargarEvaluaciones}
            disabled={estado === 'cargando'}
          >
            Actualizar
          </button>

          <button
            type="button"
            className="pnl-btn pnl-btn-primario pnl-btn-chico"
            onClick={() => setDetalle('crear')}
          >
            + Crear quiz
          </button>
        </div>
      </div>

      {estado === 'cargando' && (
        <div className="sesion-espera" role="status">
          Cargando tus quices...
        </div>
      )}

      {estado === 'error' && (
        <div className="aviso-caja" role="alert">
          <b>No se pudieron cargar los quices.</b>
          <p>{mensaje}</p>

          <button
            type="button"
            className="pnl-btn pnl-btn-secundario pnl-btn-chico"
            onClick={cargarEvaluaciones}
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {estado === 'listo' && (
        <>
          {vencidos > 0 && (
            <p className="suave-txt">
              Tienes {vencidos} {vencidos === 1 ? 'quiz vencido' : 'quices vencidos'}.
            </p>
          )}

          {evaluaciones.length === 0 ? (
            <div className="aviso-caja">
              Todavía no has creado quices.
            </div>
          ) : (
            <ul className="lista">
              {evaluaciones.map((e) => (
                <li key={e.id} className="item">
                  <span className="item-icono">Q</span>

                  <span className="item-txt">
                    <b>{e.titulo}</b>

                    <span>
                      {e.modulo?.titulo ?? 'Módulo sin nombre'}
                      {e.tema?.titulo
                        ? ` · ${e.tema.titulo}`
                        : ''}
                      {' · '}
                      {e.fechaLimite
                        ? `Cierra ${fechaFormato(e.fechaLimite)}`
                        : 'Sin fecha límite'}
                    </span>
                  </span>

                  <span
                    className="estado"
                    data-e={
                      e.vencido
                        ? 'entregado'
                        : e.estado === 'publicado'
                          ? 'calificado'
                          : 'pendiente'
                    }
                  >
                    {e.vencido
                      ? 'Vencido'
                      : e.estado === 'publicado'
                        ? 'Publicado'
                        : 'Borrador'}
                  </span>

                  {!e.habilitado && (
                    <span className="suave-txt">
                      Deshabilitado
                    </span>
                  )}
                  {e.estado === 'borrador' && (
                    <button
                      type="button"
                      className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                      onClick={() => setDetalle(`editar:${e.id}`)}
                    >
                      Editar
                    </button>
                  )}

                  <button
                    type="button"
                    className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                    onClick={() => setDetalle(e.id)}
                  >
                    Revisar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

function FormularioQuizMaestro({ evaluacion, onVolver }) {
  const moduloInicial = evaluacion?.modulo?.clave ?? '';
  const { usuario } = useSesion();

  const [modulos, setModulos] = useState([]);
  const [modulo, setModulo] = useState(
    evaluacion?.modulo?.clave ?? ''
  );
  const [publicado, setPublicado] = useState(
    evaluacion?.estado === 'publicado'
  );
  const [fechaLimite, setFechaLimite] = useState('');
  const [tema, setTema] = useState('');
  const [titulo, setTitulo] = useState(evaluacion?.titulo ?? '');
  const [preguntas, setPreguntas] = useState([
    {
      enunciado: '',
      opciones: ['', ''],
      respuestaCorrecta: 0
    }
  ]);

  const [evaluacionId, setEvaluacionId] = useState(
    evaluacion?.id ?? null
  );

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [enlaceQuiz, setEnlaceQuiz] = useState('');
  const [codigoQR, setCodigoQR] = useState('');

  useEffect(() => {
    let vigente = true;

    async function cargarDatos() {
      try {
        setCargando(true);
        setError('');

        const curso = await api('/temas');

        const asignados = usuario?.modulosAsignados ?? [];
        console.log('Usuario docente:', usuario);
        console.log('Módulos recibidos:', curso.modulos);
        console.log('Módulos asignados:', usuario?.modulosAsignados);

        const disponibles = (curso.modulos ?? []).filter(
          (m) => asignados.includes(String(m.id).trim())
        );

        console.log('Módulos disponibles:', disponibles);
        console.log('Módulo inicial:', moduloInicial);
        if (!vigente) return;

        setModulos(disponibles);

        setModulo(moduloInicial || disponibles[0]?.id || '');

        if (evaluacion?.id) {
          const datos = await api(
            `/evaluaciones/docente/${evaluacion.id}`
          );

          if (!vigente) return;

          const quiz = datos.evaluacion;

          setTitulo(quiz.titulo ?? '');

          setTema(quiz.tema?.numero ?? quiz.tema?.id ?? '');

          if (quiz.fechaLimite) {
            const fecha = new Date(quiz.fechaLimite);

            // Convertimos la fecha al formato que necesita datetime-local.
            fecha.setMinutes(
              fecha.getMinutes() - fecha.getTimezoneOffset()
            );

            setFechaLimite(fecha.toISOString().slice(0, 16));
          }
          //setTema(quiz.tema ?? '');//
          setPreguntas(
            quiz.preguntas?.length
              ? quiz.preguntas.map((p) => ({
                ...(p._id ? { _id: p._id } : {}),
                enunciado: p.enunciado ?? '',
                opciones: p.opciones?.length
                  ? [...p.opciones]
                  : ['', ''],
                respuestaCorrecta:
                  Number.isInteger(p.respuestaCorrecta)
                    ? p.respuestaCorrecta
                    : 0
              }))
              : [
                {
                  enunciado: '',
                  opciones: ['', ''],
                  respuestaCorrecta: 0
                }
              ]
          );
        }
      } catch (err) {
        if (vigente) {
          setError(err.message);
        }
      } finally {
        if (vigente) {
          setCargando(false);
        }
      }
    }

    cargarDatos();

    return () => {
      vigente = false;
    };
  }, [usuario, evaluacion?.id, moduloInicial]);

  useEffect(() => {
    if (!publicado || !evaluacionId) {
      setEnlaceQuiz('');
      setCodigoQR('');
      return;
    }

    let vigente = true;

    const enlace = `${window.location.origin}/quiz/${evaluacionId}`;

    setEnlaceQuiz(enlace);

    QRCode.toDataURL(enlace, {
      width: 220,
      margin: 2
    })
      .then((imagen) => {
        if (vigente) {
          setCodigoQR(imagen);
        }
      })
      .catch(() => {
        if (vigente) {
          setError('No fue posible generar el código QR.');
        }
      });

    return () => {
      vigente = false;
    };
  }, [publicado, evaluacionId]);

  const actualizarPregunta = (indice, campo, valor) => {
    setPreguntas((actuales) =>
      actuales.map((pregunta, i) =>
        i === indice
          ? { ...pregunta, [campo]: valor }
          : pregunta
      )
    );
  };

  const actualizarOpcion = (indicePregunta, indiceOpcion, valor) => {
    setPreguntas((actuales) =>
      actuales.map((pregunta, i) => {
        if (i !== indicePregunta) return pregunta;

        const opciones = [...pregunta.opciones];
        opciones[indiceOpcion] = valor;

        return { ...pregunta, opciones };
      })
    );
  };

  const agregarPregunta = () => {
    setPreguntas((actuales) => [
      ...actuales,
      {
        enunciado: '',
        opciones: ['', ''],
        respuestaCorrecta: 0
      }
    ]);
  };

  const eliminarPregunta = (indice) => {
    setPreguntas((actuales) =>
      actuales.filter((_, i) => i !== indice)
    );
  };

  const agregarOpcion = (indicePregunta) => {
    setPreguntas((actuales) =>
      actuales.map((pregunta, i) =>
        i === indicePregunta
          ? {
            ...pregunta,
            opciones: [...pregunta.opciones, '']
          }
          : pregunta
      )
    );
  };

  const eliminarOpcion = (indicePregunta, indiceOpcion) => {
    setPreguntas((actuales) =>
      actuales.map((pregunta, i) => {
        if (i !== indicePregunta) return pregunta;

        const opciones = pregunta.opciones.filter(
          (_, j) => j !== indiceOpcion
        );

        let respuestaCorrecta = pregunta.respuestaCorrecta;

        if (respuestaCorrecta === indiceOpcion) {
          respuestaCorrecta = 0;
        } else if (respuestaCorrecta > indiceOpcion) {
          respuestaCorrecta--;
        }

        return {
          ...pregunta,
          opciones,
          respuestaCorrecta
        };
      })
    );
  };

  const guardarBorrador = async () => {
    setError('');
    setMensaje('');

    if (!titulo.trim()) {
      setError('Escribe el título del quiz.');
      return;
    }

    if (!modulo) {
      setError('Selecciona un módulo.');
      return;
    }

    const cuerpo = {
      titulo: titulo.trim(),
      modulo,
      tema: tema || null,
      preguntas,
      fechaLimite: fechaLimite || null
    };

    try {
      setGuardando(true);

      let resultado;

      if (evaluacionId) {
        resultado = await api(
          `/evaluaciones/docente/${evaluacionId}`,
          {
            metodo: 'PUT',
            cuerpo
          }
        );
      } else {
        resultado = await api('/evaluaciones/docente', {
          metodo: 'POST',
          cuerpo
        });

        setEvaluacionId(resultado.evaluacion.id);
      }

      setMensaje(resultado.mensaje ?? 'Borrador guardado correctamente.');
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const publicarQuiz = async () => {
    setError('');
    setMensaje('');

    if (!titulo.trim()) {
      setError('Escribe el título del quiz.');
      return;
    }

    if (!modulo) {
      setError('Selecciona un módulo.');
      return;
    }

    if (!fechaLimite) {
      setError('Selecciona una fecha límite.');
      return;
    }

    if (preguntas.length === 0) {
      setError('Agrega al menos una pregunta.');
      return;
    }

    for (let i = 0; i < preguntas.length; i++) {
      const pregunta = preguntas[i];

      if (!pregunta.enunciado.trim()) {
        setError(`Escribe el enunciado de la pregunta ${i + 1}.`);
        return;
      }

      if (pregunta.opciones.length < 2 || pregunta.opciones.length > 5) {
        setError(`La pregunta ${i + 1} debe tener entre 2 y 5 opciones.`);
        return;
      }

      if (pregunta.opciones.some(opcion => !opcion.trim())) {
        setError(`Completa todas las opciones de la pregunta ${i + 1}.`);
        return;
      }

      if (
        !Number.isInteger(Number(pregunta.respuestaCorrecta)) ||
        Number(pregunta.respuestaCorrecta) < 0 ||
        Number(pregunta.respuestaCorrecta) >= pregunta.opciones.length
      ) {
        setError(`Selecciona una respuesta correcta para la pregunta ${i + 1}.`);
        return;
      }
    }

    const cuerpo = {
      titulo: titulo.trim(),
      modulo,
      tema: tema || null,
      preguntas,
      fechaLimite
    };

    try {
      setGuardando(true);

      let idQuiz = evaluacionId;

      // Primero guardamos el borrador o sus cambios.
      if (idQuiz) {
        await api(`/evaluaciones/docente/${idQuiz}`, {
          metodo: 'PUT',
          cuerpo
        });
      } else {
        const resultado = await api('/evaluaciones/docente', {
          metodo: 'POST',
          cuerpo
        });

        idQuiz = resultado.evaluacion.id;
        setEvaluacionId(idQuiz);
      }

      // Después publicamos el quiz.
      const resultadoPublicacion = await api(
        `/evaluaciones/docente/${idQuiz}/publicar`,
        {
          metodo: 'POST',
          cuerpo: { fechaLimite }
        }
      );

      setPublicado(true);
      setMensaje(
        resultadoPublicacion.mensaje ?? 'Quiz publicado correctamente.'
      );

    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <section className="panel">
        <p>Cargando formulario...</p>
      </section>
    );
  }

  return (
    <section className="panel formulario-quiz-maestro">
      <div className="panel-cabeza">
        <h1>{evaluacionId ? 'Editar quiz' : 'Crear quiz'}</h1>
        <p>
          Completa la información y guarda tu quiz como borrador.
        </p>
      </div>

      {error && (
        <div className="aviso-caja" role="alert">
          {error}
        </div>
      )}

      {mensaje && (
        <div className="aviso-caja" role="status">
          {mensaje}
        </div>
      )}

      <div className="tarjeta">
        <label htmlFor="titulo-quiz">
          <strong>Título del quiz</strong>
        </label>

        <input
          id="titulo-quiz"
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej. Quiz de límites"
        />

        <label htmlFor="modulo-quiz">
          <strong>Módulo</strong>
        </label>

        <select
          id="modulo-quiz"
          value={modulo}
          onChange={(e) => {
            setModulo(e.target.value);
            setTema('');
          }}
        >
          <option value="">Selecciona un módulo</option>

          {modulos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.titulo}
            </option>
          ))}
        </select>

        <label htmlFor="tema-quiz">
          <strong>Tema (opcional)</strong>
        </label>

        <select
          id="tema-quiz"
          value={tema}
          onChange={(e) => setTema(e.target.value)}
          disabled={!modulo}
        >
          <option value="">Sin tema específico</option>

          {(
            modulos.find((m) => m.id === modulo)?.temas ?? []
          ).map((t) => (
            <option key={t.id} value={t.id}>
              {t.titulo}
            </option>
          ))}
        </select>

        <label htmlFor="fecha-limite-quiz">
          <strong>Fecha y hora límite</strong>
        </label>

        <input
          id="fecha-limite-quiz"
          type="datetime-local"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
        />

        <p className="suave-txt">
          La fecha debe ser futura y no puede superar los seis meses.
        </p>

        {modulos.length === 0 && (
          <p className="suave-txt">
            No tienes módulos asignados. Solicita al administrador que te asigne uno.
          </p>
        )}
      </div>

      <div className="cabeza-fila">
        <div>
          <h2>Preguntas</h2>
          <p className="suave-txt">
            Cada pregunta debe tener entre 2 y 5 opciones y una respuesta correcta para poder publicar.
          </p>
        </div>

        <button
          type="button"
          className="pnl-btn pnl-btn-secundario pnl-btn-chico"
          onClick={agregarPregunta}
        >
          + Añadir pregunta
        </button>
      </div>

      {preguntas.map((pregunta, indice) => (
        <div className="tarjeta" key={pregunta._id ?? indice}>
          <div className="cabeza-fila">
            <h3>Pregunta {indice + 1}</h3>

            {preguntas.length > 1 && (
              <button
                type="button"
                className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                onClick={() => eliminarPregunta(indice)}
              >
                Eliminar
              </button>
            )}
          </div>

          <label htmlFor={`enunciado-${indice}`}>
            <strong>Enunciado</strong>
          </label>

          <textarea
            id={`enunciado-${indice}`}
            value={pregunta.enunciado}
            onChange={(e) =>
              actualizarPregunta(indice, 'enunciado', e.target.value)
            }
            placeholder="Escribe el enunciado de la pregunta..."
            rows={3}
          />

          <p><strong>Opciones de respuesta</strong></p>

          {pregunta.opciones.map((opcion, indiceOpcion) => (
            <div className="fila-botones" key={indiceOpcion}>
              <input
                type="radio"
                name={`correcta-${indice}`}
                checked={pregunta.respuestaCorrecta === indiceOpcion}
                onChange={() =>
                  actualizarPregunta(
                    indice,
                    'respuestaCorrecta',
                    indiceOpcion
                  )
                }
                aria-label={`Marcar opción ${indiceOpcion + 1} como correcta`}
              />

              <input
                type="text"
                value={opcion}
                onChange={(e) =>
                  actualizarOpcion(
                    indice,
                    indiceOpcion,
                    e.target.value
                  )
                }
                placeholder={`Opción ${indiceOpcion + 1}`}
              />

              <button
                type="button"
                className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                disabled={pregunta.opciones.length <= 2}
                onClick={() =>
                  eliminarOpcion(indice, indiceOpcion)
                }
              >
                Quitar
              </button>
            </div>
          ))}

          <button
            type="button"
            className="pnl-btn pnl-btn-secundario pnl-btn-chico"
            disabled={pregunta.opciones.length >= 5}
            onClick={() => agregarOpcion(indice)}
          >
            + Añadir opción
          </button>

          <p className="suave-txt">
            Marca el círculo de la opción que será correcta.
          </p>
        </div>
      ))}

      {publicado && enlaceQuiz && (
        <div className="tarjeta">
          <h2>Compartir quiz</h2>

          <p className="suave-txt">
            Comparte este enlace con los estudiantes para que puedan acceder al quiz.
          </p>

          <label htmlFor="enlace-quiz">
            <strong>Enlace del quiz</strong>
          </label>

          <div className="fila-botones">
            <input
              id="enlace-quiz"
              type="text"
              value={enlaceQuiz}
              readOnly
            />

            <button
              type="button"
              className="pnl-btn pnl-btn-secundario"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(enlaceQuiz);
                  setMensaje('Enlace copiado correctamente.');
                } catch {
                  setError('No fue posible copiar el enlace.');
                }
              }}
            >
              Copiar enlace
            </button>
          </div>

          <div>
            <p><strong>Código QR</strong></p>

            {codigoQR ? (
              <img
                src={codigoQR}
                alt="Código QR para acceder al quiz"
                width="220"
                height="220"
              />
            ) : (
              <p className="suave-txt">Generando código QR...</p>
            )}
          </div>
        </div>
      )}

      <div className="fila-botones">
        <button
          type="button"
          className="pnl-btn pnl-btn-secundario"
          onClick={onVolver}
        >
          Volver
        </button>

        {!publicado && (
          <>
            <button
              type="button"
              className="pnl-btn pnl-btn-secundario"
              onClick={guardarBorrador}
              disabled={guardando || modulos.length === 0}
            >
              {guardando ? 'Guardando...' : 'Guardar borrador'}
            </button>

            <button
              type="button"
              className="pnl-btn pnl-btn-primario"
              onClick={publicarQuiz}
              disabled={guardando || modulos.length === 0}
            >
              {guardando ? 'Procesando...' : 'Publicar quiz'}
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function DetalleMaestro({ evaluacion, onVolver }) {
  const [datos, setDatos] = useState(null);
  const [estado, setEstado] = useState('cargando');
  const [mensaje, setMensaje] = useState('');

  const cargarNotas = useCallback(async () => {
    if (!evaluacion?.id) return;

    setEstado('cargando');
    setMensaje('');

    try {
      const resultado = await api(
        `/evaluaciones/docente/${evaluacion.id}/notas`
      );

      setDatos(resultado);
      setEstado('listo');
    } catch (error) {
      setMensaje(error.message);
      setEstado('error');
    }
  }, [evaluacion?.id]);

  useEffect(() => {
    cargarNotas();
  }, [cargarNotas]);

  const fechaFormato = (fecha) => {
    if (!fecha) return 'Sin fecha';

    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'America/Bogota',
    }).format(new Date(fecha));
  };

  if (!evaluacion) {
    return (
      <section className="panel">
        <button
          type="button"
          className="boton-volver"
          onClick={onVolver}
        >
          ← Volver a mis quices
        </button>

        <div className="aviso-caja">
          No se encontró el quiz seleccionado.
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <button
        type="button"
        className="boton-volver"
        onClick={onVolver}
      >
        ← Volver a mis quices
      </button>

      <div className="panel-cabeza">
        <h1>{evaluacion.titulo}</h1>
        <p>
          {evaluacion.modulo?.titulo ?? 'Módulo sin nombre'}
          {' · '}
          {evaluacion.tema?.titulo ?? 'Sin tema específico'}
        </p>
      </div>

      {estado === 'cargando' && (
        <div className="sesion-espera" role="status">
          Cargando las notas...
        </div>
      )}

      {estado === 'error' && (
        <div className="aviso-caja" role="alert">
          <b>No se pudieron cargar las notas.</b>
          <p>{mensaje}</p>

          <button
            type="button"
            className="pnl-btn pnl-btn-secundario pnl-btn-chico"
            onClick={cargarNotas}
          >
            Intentar nuevamente
          </button>
        </div>
      )}

      {estado === 'listo' && (
        <>
          <div className="fila-3">
            <div className="tarjeta">
              <span className="mini-label">Entregas recibidas</span>
              <span className="mini-num">
                {datos.cantidadRespuestas}
              </span>
            </div>

            <div className="tarjeta">
              <span className="mini-label">Promedio del quiz</span>
              <span className="mini-num">
                {datos.promedio !== null
                  ? datos.promedio.toFixed(1)
                  : '—'}
                <small> / 5.0</small>
              </span>
            </div>

            <div className="tarjeta">
              <span className="mini-label">Preguntas</span>
              <span className="mini-num">
                {datos.evaluacion.totalPreguntas}
              </span>
            </div>
          </div>

          <div className="cabeza-fila">
            <h2>Estudiantes que respondieron</h2>

            <button
              type="button"
              className="pnl-btn pnl-btn-secundario pnl-btn-chico"
              onClick={cargarNotas}
            >
              Actualizar notas
            </button>
          </div>

          {datos.notas.length === 0 ? (
            <div className="aviso-caja">
              Ningún estudiante ha respondido este quiz todavía.
            </div>
          ) : (
            <div className="tabla-caja">
              <table className="tabla-panel">
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Fecha de entrega</th>
                    <th>Respuestas correctas</th>
                    <th>Nota</th>
                  </tr>
                </thead>

                <tbody>
                  {datos.notas.map((nota) => (
                    <tr key={nota.estudiante.id}>
                      <td>
                        <span className="alumno">
                          {nota.estudiante.nombre}
                        </span>
                        <small className="suave-txt">
                          {nota.estudiante.correo}
                        </small>
                      </td>

                      <td>
                        {fechaFormato(nota.fechaRespuesta)}
                      </td>

                      <td>
                        {nota.aciertos} de {nota.totalPreguntas}
                      </td>

                      <td>
                        <b className="nota-grande">
                          {nota.nota.toFixed(1)}
                        </b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

