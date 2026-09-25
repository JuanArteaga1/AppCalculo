import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ALUMNOS,
  ETIQUETA_ESTADO,
  EVALUACIONES,
  PREGUNTAS,
  UNIDADES_PROGRESO,
} from '../../data/mockEspacio';

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
      <button type="button" className="volver" onClick={onVolver}>← Volver a Evalúate</button>
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
  const [detalle, setDetalle] = useState(null);

  if (detalle) {
    const evaluacion = EVALUACIONES.find((e) => e.id === detalle);
    return <DetalleMaestro evaluacion={evaluacion} onVolver={() => setDetalle(null)} />;
  }

  const porCalificar = EVALUACIONES.reduce((a, e) => a + e.porCalificar, 0);

  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Evalúate</h1>
        <p>
          Las evaluaciones que creaste para Cálculo I, grupo 03. Entra a una para ver
          quién respondió y calificar.
        </p>
      </div>

      <div className="fila-3">
        <div className="tarjeta"><span className="mini-label">Evaluaciones creadas</span><span className="mini-num">{EVALUACIONES.length}</span></div>
        <div className="tarjeta"><span className="mini-label">Entregas por calificar</span><span className="mini-num">{porCalificar}</span></div>
        <div className="tarjeta"><span className="mini-label">Promedio del grupo</span><span className="mini-num">4.1 <small>/ 5.0</small></span></div>
      </div>

      <div className="cabeza-fila">
        <h2>Mis evaluaciones</h2>
        <button type="button" className="pnl-btn pnl-btn-primario pnl-btn-chico">+ Crear evaluación</button>
      </div>

      <ul className="lista">
        {EVALUACIONES.map((e) => (
          <li key={e.id} className="item">
            <span className="item-icono">{e.tipo.slice(0, 1)}</span>
            <span className="item-txt">
              <b>{e.titulo}</b>
              <span>{e.tipo} · {e.unidad} · cierra {e.vence}</span>
            </span>
            <span className="estado" data-e={e.porCalificar ? 'pendiente' : 'calificado'}>
              {e.porCalificar ? `${e.porCalificar} por calificar` : 'Todo calificado'}
            </span>
            <span className="suave-txt">{e.entregas}/{e.total} entregas</span>
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
    </section>
  );
}

function DetalleMaestro({ evaluacion, onVolver }) {
  const [alumno, setAlumno] = useState(null);
  const elegido = alumno === null ? null : ALUMNOS[alumno];

  return (
    <section className="panel">
      <button type="button" className="volver" onClick={onVolver}>← Volver a mis evaluaciones</button>
      <div className="panel-cabeza">
        <h1>{evaluacion.titulo}</h1>
        <p>{evaluacion.tipo} · {evaluacion.unidad} · cierra {evaluacion.vence}</p>
      </div>

      <div className="fila-3">
        <div className="tarjeta">
          <span className="mini-label">Entregas</span>
          <span className="mini-num">{evaluacion.entregas} <small>de {evaluacion.total}</small></span>
          <div className="barra-simple">
            <i style={{ width: `${Math.round(evaluacion.entregas / evaluacion.total * 100)}%` }} />
          </div>
        </div>
        <div className="tarjeta"><span className="mini-label">Por calificar</span><span className="mini-num">{evaluacion.porCalificar}</span></div>
        <div className="tarjeta"><span className="mini-label">Promedio</span><span className="mini-num">4.2 <small>/ 5.0</small></span></div>
      </div>

      {elegido && (
        <div className="tarjeta">
          <div className="cabeza-fila">
            <h2>Respuestas de {elegido.n}</h2>
            <span className="suave-txt">Entregado {elegido.entregado}</span>
          </div>
          {PREGUNTAS.map((q, k) => (
            <div key={q.p} className="respuesta-alumno">
              <small>{k + 1}. {q.p}</small>
              <b>{q.ops[k === 1 ? 0 : q.correcta]}</b>{' '}
              <span className="estado" data-e={k === 1 ? 'pendiente' : 'calificado'}>
                {k === 1 ? 'Respuesta incorrecta' : 'Correcta'}
              </span>
            </div>
          ))}
          <div className="calif-fila">
            <label className="mini-label" htmlFor="nota">Nota</label>
            <input id="nota" type="number" min="0" max="5" step="0.1" defaultValue={elegido.nota ?? 3.3} />
            <input type="text" placeholder="Comentario para el estudiante" defaultValue="Repasa la derivada de sin(2x)." />
            <button type="button" className="pnl-btn pnl-btn-azul pnl-btn-chico" onClick={() => setAlumno(null)}>
              Guardar nota
            </button>
          </div>
        </div>
      )}

      <div className="tarjeta">
        <div className="cabeza-fila">
          <h2>Estudiantes</h2>
          <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico">Descargar notas</button>
        </div>
        <div className="tabla-caja">
          <table className="tabla-panel">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Entregado</th>
                <th>Estado</th>
                <th>Nota</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {ALUMNOS.map((a, k) => (
                <tr key={a.n}>
                  <td><span className="alumno"><span>{a.i}</span>{a.n}</span></td>
                  <td>{a.entregado}</td>
                  <td>
                    {a.sinEntregar
                      ? <span className="estado">Sin entregar</span>
                      : a.nota
                        ? <span className="estado" data-e="calificado">Calificado</span>
                        : <span className="estado" data-e="entregado">Por calificar</span>}
                  </td>
                  <td>{a.nota ? <b className="nota-grande">{a.nota.toFixed(1)}</b> : '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    {a.sinEntregar ? (
                      <span className="suave-txt">—</span>
                    ) : (
                      <button
                        type="button"
                        className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                        onClick={() => setAlumno(k)}
                      >
                        {a.nota ? 'Ver' : 'Calificar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
