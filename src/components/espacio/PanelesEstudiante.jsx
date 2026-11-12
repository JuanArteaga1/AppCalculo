import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { alerta, alertaReintentar } from '../../services/alertas';
import { EstructuraQuizDocente } from './EstructuraQuiz';
import QRCode from 'qrcode';
import { unidades } from '../../data/temas';
import { obtenerProgreso } from '../../services/progresoService';

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

/** Solo nombres de unidad: los títulos de tema pueden ser privados o estar eliminados. */
function unidadesVacias() {
  return unidades.map((m) => ({
    id: m.id,
    nombre: m.titulo,
    pct: 0,
    temas: 'Sin avance registrado',
    sigue: 'Abre un tema para empezar',
  }));
}

export function PanelProgreso() {
  const [datos, setDatos] = useState(() => ({
    porModulo: unidadesVacias(),
    ultimo: null,
    notas: [],
    promedio: 0,
    pctGeneral: 0,
    temasVisitados: 0,
    totalTemas: 0,
  }));

  useEffect(() => {
    let vigente = true;
    obtenerProgreso().then((resumen) => {
      if (!vigente) return;
      setDatos({
        ...resumen,
        porModulo: resumen.porModulo?.length ? resumen.porModulo : unidadesVacias(),
        notas: resumen.notas ?? [],
        promedio: resumen.promedio ?? 0,
        pctGeneral: resumen.pctGeneral ?? 0,
      });
    });
    return () => {
      vigente = false;
    };
  }, []);

  const ultimo = datos.ultimo;

  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Mi progreso</h1>
        <p>Así vas en Cálculo I. Cada unidad avanza a tu ritmo.</p>
      </div>

      <div className="fila-3">
        <div className="tarjeta">
          <span className="mini-label">Avance general</span>
          <span className="mini-num">{datos.pctGeneral ?? 0} <small>%</small></span>
        </div>
        <div className="tarjeta">
          <span className="mini-label">Temas abiertos</span>
          <span className="mini-num">{datos.temasVisitados ?? 0} <small>/ {datos.totalTemas ?? 0}</small></span>
        </div>
        <div className="tarjeta">
          <span className="mini-label">Promedio</span>
          <span className="mini-num">{Number(datos.promedio || 0).toFixed(1)} <small>/ 5.0</small></span>
        </div>
      </div>

      <div className="tarjeta continuar">
        <div className="continuar-txt">
          <span className="mini-label">Continuar donde lo dejaste</span>
          {ultimo ? (
            <>
              <b>{ultimo.tema} · {ultimo.titulo}</b>
              <span className="suave-txt">Primera visita y última visita quedan registradas con tu sesión.</span>
            </>
          ) : (
            <>
              <b>Todavía no abriste un tema</b>
              <span className="suave-txt">Empieza por el primer tema de Límites. Tu avance se guarda al entrar.</span>
            </>
          )}
        </div>
        <Link className="pnl-btn pnl-btn-primario" to={ultimo?.ruta || '/calculo1/limites/1.1'}>
          {ultimo ? 'Continuar lección' : 'Empezar'} <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="fila-3">
        {(datos.porModulo ?? []).map((u) => (
          <div key={u.id || u.nombre} className="tarjeta unidad-prog">
            <Anillo pct={u.pct ?? 0} />
            <span className="unidad-nombre">{u.nombre}</span>
            <span className="suave-txt">{u.temas}</span>
            <div className="unidad-sig">
              Sigue con
              <b>{u.sigue}</b>
            </div>
          </div>
        ))}
      </div>

      <div className="tarjeta">
        <h2>Notas</h2>
        {(datos.notas ?? []).length === 0 ? (
          <p className="suave-txt">Aún no tienes notas. El promedio es 0.0 hasta que se califiquen evaluaciones.</p>
        ) : (
          <ul className="lista">
            {datos.notas.map((n) => (
              <li key={n.evaluacionId} className="item">
                <span className="item-txt"><b>{n.titulo}</b></span>
                <span className="nota-grande">{Number(n.nota).toFixed(1)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/** Lista de talleres y quices del estudiante. Hoy los quices con nota están pausados. */
const ESTADO_QUIZ = {
  pendiente: { texto: 'Por responder', marca: 'pendiente' },
  respondido: { texto: 'Respondido', marca: 'calificado' },
  vencido: { texto: 'Vencido', marca: 'entregado' },
  'no-disponible': { texto: 'No disponible', marca: undefined },
};

const cierre = (fecha) =>
  fecha
    ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(fecha))
    : 'sin fecha';

/**
 * Evalúate del estudiante (spec-estudiante RF-03): los quices que abrió por
 * enlace o QR, con su estado y su nota.
 */
export function PanelAprenderEstudiante() {
  const [quices, setQuices] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [mensaje, setMensaje] = useState('');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vigente = true;

    api('/evaluaciones/estudiante')
      .then((datos) => {
        if (!vigente) return;
        setQuices(datos.evaluaciones ?? []);
        setEstado('listo');
      })
      .catch((error) => {
        if (!vigente) return;
        setMensaje(error.message);
        setEstado('error');
      });

    return () => {
      vigente = false;
    };
  }, [intento]);

  const porHacer = quices.filter((q) => q.estado === 'pendiente').length;
  const notas = quices.filter((q) => q.estado === 'respondido').map((q) => q.nota);
  const promedio = notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null;

  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Evalúate</h1>
        <p>Los quices que abriste con el enlace o el código QR de tu docente.</p>
      </div>

      <div className="fila-3">
        <div className="tarjeta"><span className="mini-label">Por responder</span><span className="mini-num">{porHacer}</span></div>
        <div className="tarjeta"><span className="mini-label">Respondidos</span><span className="mini-num">{notas.length}</span></div>
        <div className="tarjeta">
          <span className="mini-label">Promedio</span>
          <span className="mini-num">{promedio === null ? '—' : promedio.toFixed(1)} <small>/ 5.0</small></span>
        </div>
      </div>

      {estado === 'cargando' && <div className="sesion-espera" role="status">Cargando tus quices...</div>}

      {estado === 'error' && (
        <div className="aviso-caja" role="alert">
          <b>No se pudieron cargar tus quices.</b>
          <p>{mensaje}</p>
          <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={() => setIntento((n) => n + 1)}>
            Intentar de nuevo
          </button>
        </div>
      )}

      {estado === 'listo' && quices.length === 0 && (
        <div className="aviso-caja">
          Todavía no tienes quices. Cuando tu docente te comparta un enlace o un código QR, ábrelo y aparecerá aquí.
          Mientras tanto puedes <Link to="/evaluate">practicar sin nota</Link>.
        </div>
      )}

      {estado === 'listo' && quices.length > 0 && (
        <ul className="lista">
          {quices.map((q) => {
            const info = ESTADO_QUIZ[q.estado] ?? ESTADO_QUIZ['no-disponible'];

            return (
              <li key={q.id} className="item">
                <span className="item-icono">Q</span>
                <span className="item-txt">
                  <b>{q.titulo}</b>
                  <span>
                    {q.modulo?.titulo ?? 'Módulo'}
                    {q.temas?.length ? ` · ${q.temas.map((t) => t.titulo).join(', ')}` : ''}
                    {' · '}
                    {q.estado === 'respondido' ? `Enviado ${cierre(q.fechaRespuesta)}` : `Cierra ${cierre(q.fechaLimite)}`}
                  </span>
                </span>
                {q.estado === 'respondido' && <span className="nota-grande">{Number(q.nota).toFixed(1)}</span>}
                <span className="estado" data-e={info.marca}>{info.texto}</span>
                {q.estado === 'pendiente' && (
                  <Link className="pnl-btn pnl-btn-primario pnl-btn-chico" to={`/quiz/${q.id}`}>Responder</Link>
                )}
                {q.estado === 'respondido' && (
                  <Link className="pnl-btn pnl-btn-secundario pnl-btn-chico" to={`/quiz/${q.id}`}>
                    {q.vencido ? 'Ver correctas' : 'Ver resultado'}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

/** Vista del maestro: sus evaluaciones y quién ya entregó. */

export function PanelAprenderMaestro() {
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [mensaje, setMensaje] = useState('');
  const [detalle, setDetalle] = useState(null);

  async function cargarEvaluaciones() {
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
  }

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      setEstado('cargando');
      setMensaje('');

      try {
        const datos = await api('/evaluaciones/docente');

        if (!vigente) return;
        setEvaluaciones(datos.evaluaciones ?? []);
        setEstado('listo');
      } catch (error) {
        if (!vigente) return;
        setMensaje(error.message);
        setEstado('error');
      }
    }

    cargar();

    return () => {
      vigente = false;
    };
  }, []);

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
            Quices que has creado para el curso.
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
                      {' · '}
                      {e.temas?.length
                        ? e.temas.map((t) => t.titulo).join(', ')
                        : 'Sin tema'}
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

  const [modulos, setModulos] = useState([]);
  const [modulo, setModulo] = useState(
    evaluacion?.modulo?.clave ?? ''
  );
  const [publicado, setPublicado] = useState(
    evaluacion?.estado === 'publicado'
  );
  const [fechaLimite, setFechaLimite] = useState('');
  const [temas, setTemas] = useState([]);
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
  const [codigoQR, setCodigoQR] = useState('');

  const enlaceQuiz = publicado && evaluacionId
    ? `${window.location.origin}/quiz/${evaluacionId}`
    : '';

  useEffect(() => {
    let vigente = true;

    async function cargarDatos() {
      try {
        setCargando(true);

        const curso = await api('/temas');

        const todos = curso.modulos ?? [];
        if (!vigente) return;

        setModulos(todos);

        setModulo(moduloInicial || todos[0]?.id || '');

        if (evaluacion?.id) {
          const datos = await api(
            `/evaluaciones/docente/${evaluacion.id}`
          );

          if (!vigente) return;

          const quiz = datos.evaluacion;

          setTitulo(quiz.titulo ?? '');

          setTemas((quiz.temas ?? []).map((t) => t.numero ?? t.id ?? '').filter(Boolean));

          if (quiz.fechaLimite) {
            const fecha = new Date(quiz.fechaLimite);

            // Convertimos la fecha al formato que necesita datetime-local.
            fecha.setMinutes(
              fecha.getMinutes() - fecha.getTimezoneOffset()
            );

            setFechaLimite(fecha.toISOString().slice(0, 16));
          }
          //setTema(quiz.tema ?? '')//
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
          alertaReintentar(
            'No se cargó el formulario',
            err,
            cargarDatos
          );
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
  }, [evaluacion?.id, moduloInicial]);

  useEffect(() => {
    if (!publicado || !evaluacionId) return undefined;

    let vigente = true;

    QRCode.toDataURL(enlaceQuiz, {
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
          alerta.error(
            'Código QR',
            'No fue posible generar el código QR.'
          );
        }
      });

    return () => {
      vigente = false;
    };
  }, [publicado, evaluacionId, enlaceQuiz]);

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
    if (!titulo.trim()) {
      alerta.aviso('Revisa el quiz', 'Escribe el título del quiz.');
      return;
    }

    if (!modulo) {
      alerta.aviso('Revisa el quiz', 'Selecciona un módulo.');
      return;
    }

    if (temas.length === 0) {
      alerta.aviso('Revisa el quiz', 'Agrega al menos un tema del módulo.');
      return;
    }

    const cuerpo = {
      titulo: titulo.trim(),
      modulo,
      temas,
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

      alerta.ok(
        'Quiz guardado',
        resultado.mensaje ?? 'Borrador guardado correctamente.'
      );
    } catch (err) {
      alerta.error('No se pudo guardar el quiz', err);
    } finally {
      setGuardando(false);
    }
  };

  const publicarQuiz = async () => {
    if (!titulo.trim()) {
      alerta.aviso('Revisa el quiz', 'Escribe el título del quiz.');
      return;
    }

    if (!modulo) {
      alerta.aviso('Revisa el quiz', 'Selecciona un módulo.');
      return;
    }

    if (temas.length === 0) {
      alerta.aviso('Revisa el quiz', 'Agrega al menos un tema del módulo.');
      return;
    }

    if (!fechaLimite) {
      alerta.aviso('Revisa el quiz', 'Selecciona una fecha límite.');
      return;
    }

    if (preguntas.length === 0) {
      alerta.aviso('Revisa el quiz', 'Agrega al menos una pregunta.');
      return;
    }

    for (let i = 0; i < preguntas.length; i++) {
      const pregunta = preguntas[i];

      if (!pregunta.enunciado.trim()) {
        alerta.aviso('Revisa el quiz', `Escribe el enunciado de la pregunta ${i + 1}.`);
        return;
      }

      if (pregunta.opciones.length < 2 || pregunta.opciones.length > 5) {
        alerta.aviso('Revisa el quiz', `La pregunta ${i + 1} debe tener entre 2 y 5 opciones.`);
        return;
      }

      if (pregunta.opciones.some(opcion => !opcion.trim())) {
        alerta.aviso('Revisa el quiz', `Completa todas las opciones de la pregunta ${i + 1}.`);
        return;
      }

      if (
        !Number.isInteger(Number(pregunta.respuestaCorrecta)) ||
        Number(pregunta.respuestaCorrecta) < 0 ||
        Number(pregunta.respuestaCorrecta) >= pregunta.opciones.length
      ) {
        alerta.aviso('Revisa el quiz', `Selecciona una respuesta correcta para la pregunta ${i + 1}.`);
        return;
      }
    }

    const cuerpo = {
      titulo: titulo.trim(),
      modulo,
      temas,
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
      alerta.ok(
        'Quiz publicado',
        resultadoPublicacion.mensaje ?? 'Quiz publicado correctamente.'
      );

    } catch (err) {
      alerta.error('No se pudo publicar el quiz', err);
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
            setTemas([]);
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
          <strong>Temas</strong>
          <span className="suave-txt"> (elige uno o varios del módulo)</span>
        </label>

        {temas.length > 0 && (
          <div className="lista-pastillas">
            {temas.map((id) => {
              const info = modulos
                .find((m) => m.id === modulo)
                ?.temas?.find((t) => t.id === id);

              return (
                <span key={id} className="pastilla pastilla-tema">
                  {info?.titulo ?? id}
                  <button
                    type="button"
                    onClick={() => setTemas((actuales) => actuales.filter((t) => t !== id))}
                    aria-label={`Quitar ${info?.titulo ?? id}`}
                    title="Quitar"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}

        <select
          id="tema-quiz"
          value=""
          onChange={(e) => {
            const id = e.target.value;
            if (!id) return;
            setTemas((actuales) => (actuales.includes(id) ? actuales : [...actuales, id]));
          }}
          disabled={!modulo}
        >
          <option value="">
            {temas.length === 0 ? 'Selecciona un tema' : 'Agregar otro tema'}
          </option>

          {(
            modulos.find((m) => m.id === modulo)?.temas ?? []
          )
            .filter((t) => !temas.includes(t.id))
            .map((t) => (
              <option key={t.id} value={t.id}>
                {t.titulo}
              </option>
            ))}
        </select>

        {temas.length === 0 && modulo && (
          <p className="suave-txt">Agrega al menos un tema del módulo.</p>
        )}

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
            No se pudieron cargar los módulos del curso. Intenta recargar la página.
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
                  alerta.ok('Enlace copiado', 'El enlace del quiz está en el portapapeles.');
                } catch {
                  alerta.error('No se pudo copiar', 'No fue posible copiar el enlace.');
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

  async function cargarNotas() {
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
  }

  useEffect(() => {
    if (!evaluacion?.id) return undefined;

    let vigente = true;

    async function cargar() {
      setEstado('cargando');
      setMensaje('');

      try {
        const resultado = await api(
          `/evaluaciones/docente/${evaluacion.id}/notas`
        );

        if (!vigente) return;
        setDatos(resultado);
        setEstado('listo');
      } catch (error) {
        if (!vigente) return;
        setMensaje(error.message);
        setEstado('error');
      }
    }

    cargar();

    return () => {
      vigente = false;
    };
  }, [evaluacion?.id]);

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
          {evaluacion.temas?.length
            ? evaluacion.temas.map((t) => t.titulo).join(', ')
            : 'Sin tema'}
        </p>
      </div>

      <EstructuraQuizDocente id={evaluacion.id} />

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

