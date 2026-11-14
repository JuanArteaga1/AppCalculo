
import { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { api } from '../../services/api';
import { Anillo } from './PanelesEstudiante';

const inicialesNombre = (nombre = '') =>
  nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('');

const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin actividad';

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) return 'Sin actividad';

  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Bogota',
  }).format(valor);
};

/**
 * Lista los estudiantes que han realizado quices del docente.
 * Combina el progreso académico con las evaluaciones realizadas.
 */
export default function PanelEstudiantes() {
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState(null);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;

    const cargarEstudiantes = async () => {
      try {
        setCargando(true);
        setError('');

        const [respuestaProgreso, respuestaEvaluaciones] = await Promise.all([
          api('/progreso/docente/estudiantes'),
          api('/evaluaciones/docente/estudiantes'),
        ]);

        if (!activo) return;

        const progresos = new Map(
          (respuestaProgreso.estudiantes ?? []).map((estudiante) => [
            String(estudiante.id),
            estudiante,
          ])
        );

        const lista = (respuestaEvaluaciones.estudiantes ?? []).map((estudiante) => {
          const progreso = progresos.get(String(estudiante.id));

          return {
            ...estudiante,

            // Progreso general del curso.
            pctGeneral: progreso?.pctGeneral ?? 0,
            totalTemas: progreso?.totalTemas ?? 0,
            temasVisitados: progreso?.temasVisitados ?? 0,

            // Progreso de cada módulo.
            porModulo: progreso?.porModulo ?? [],

            // Actividad académica.
            ultimo: progreso?.ultimo ?? null,
            videosVistos: progreso?.videosVistos ?? 0,
            ejerciciosGuardados: progreso?.ejerciciosGuardados ?? 0,

            iniciales:
              estudiante.iniciales || inicialesNombre(estudiante.nombre),

            notas: estudiante.notas ?? [],
            entregas: estudiante.entregas ?? 0,
          };
        });

        setEstudiantes(lista);
      } catch (err) {
        if (activo) {
          setError(err.message || 'No fue posible cargar los estudiantes.');
        }
      } finally {
        if (activo) setCargando(false);
      }
    };

    cargarEstudiantes();

    return () => {
      activo = false;
    };
  }, []);

  const termino = busqueda.trim().toLowerCase();

  const lista = termino
    ? estudiantes.filter((e) =>
      `${e.nombre} ${e.correo}`.toLowerCase().includes(termino)
    )
    : estudiantes;

  const estudiantesConPromedio = estudiantes.filter(
    (e) => e.promedio != null && Number.isFinite(Number(e.promedio))
  );

  const enRiesgo = estudiantes.filter(
    (e) => e.pctGeneral < 30
  ).length;

  const promedioGrupo = estudiantesConPromedio.length
    ? (
      estudiantesConPromedio.reduce(
        (total, e) => total + Number(e.promedio),
        0
      ) / estudiantesConPromedio.length
    ).toFixed(1)
    : '—';

  const avanceGrupo = estudiantes.length
    ? Math.round(
      estudiantes.reduce((total, e) => total + e.pctGeneral, 0) /
      estudiantes.length
    )
    : 0;

  if (cargando) {
    return (
      <section className="panel">
        <div className="panel-cabeza">
          <h1>Estudiantes</h1>
          <p>Cargando información de los estudiantes...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <div className="panel-cabeza">
          <h1>Estudiantes</h1>
          <p>{error}</p>
          <button
            type="button"
            className="pnl-btn pnl-btn-secundario"
            onClick={() => window.location.reload()}
          >
            Intentar de nuevo
          </button>
        </div>
      </section>
    );
  }

  if (abierto) {
    const estudiante = estudiantes.find((e) => e.id === abierto);

    if (estudiante) {
      return (
        <PerfilEstudiante
          estudiante={estudiante}
          onVolver={() => setAbierto(null)}
        />
      );
    }
  }

  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Estudiantes</h1>
        <p>
          Consulta el avance de los estudiantes que han realizado tus quices.
          Entra a un estudiante para ver su progreso completo.
        </p>
      </div>

      <div className="fila-3">
        <div className="tarjeta">
          <span className="mini-label">Estudiantes</span>
          <span className="mini-num">{estudiantes.length}</span>
        </div>

        <div className="tarjeta">
          <span className="mini-label">Avance del grupo</span>
          <span className="mini-num">
            {avanceGrupo}<small> %</small>
          </span>
          <div className="barra-simple">
            <i style={{ width: `${avanceGrupo}%` }} />
          </div>
        </div>

        <div className="tarjeta">
          <span className="mini-label">
            {enRiesgo > 0 ? 'Promedio · en riesgo' : 'Promedio del grupo'}
          </span>
          <span className="mini-num">
            {promedioGrupo}
            <small> / 5.0 · {enRiesgo} en riesgo</small>
          </span>
        </div>
      </div>

      <div className="tarjeta">
        <label className="pregunta-caja" htmlFor="buscar-estudiante">
          <FiSearch aria-hidden="true" />
          <input
            id="buscar-estudiante"
            type="search"
            placeholder="Buscar por nombre o correo…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </label>

        <div className="tabla-caja">
          <table className="tabla-panel">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Progreso del curso</th>
                <th>Promedio</th>
                <th>Entregas</th>
                <th>Última actividad</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>

            <tbody>
              {lista.map((e) => {
                const ultimaActividad =
                  e.ultimoAcceso || e.ultimo?.ultimaVisita;

                return (
                  <tr key={e.id}>
                    <td>
                      <span className="alumno">
                        <span>{e.iniciales}</span>
                        <span className="alumno-datos">
                          <b>{e.nombre}</b>
                          <small>{e.correo}</small>
                        </span>
                      </span>
                    </td>

                    <td>
                      <div className="celda-progreso">
                        <div className="barra-simple">
                          <i style={{ width: `${e.pctGeneral}%` }} />
                        </div>
                        <span className="suave-txt">{e.pctGeneral}%</span>
                      </div>
                    </td>

                    <td>
                      <b className="nota-grande">
                        {e.promedio != null
                          ? Number(e.promedio).toFixed(1)
                          : '—'}
                      </b>
                    </td>

                    <td>{e.entregas}</td>

                    <td>
                      <small className="suave-txt">
                        {formatearFecha(ultimaActividad)}
                      </small>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                        onClick={() => setAbierto(e.id)}
                      >
                        Ver perfil
                      </button>
                    </td>
                  </tr>
                );
              })}

              {!lista.length && (
                <tr>
                  <td colSpan={6} className="suave-txt">
                    {estudiantes.length
                      ? 'Ningún estudiante coincide con la búsqueda.'
                      : 'Todavía no hay estudiantes que hayan realizado tus quices.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function PerfilEstudiante({ estudiante, onVolver }) {
  const pct = estudiante.pctGeneral;

  const ultimaActividad =
    estudiante.ultimoAcceso || estudiante.ultimo?.ultimaVisita;

  return (
    <section className="panel">
      <button
        type="button"
        className="boton-volver"
        onClick={onVolver}
      >
        ← Volver a Estudiantes
      </button>

      <div className="tarjeta ficha-estudiante">
        <span className="lat-avatar ficha-avatar">
          {estudiante.iniciales}
        </span>

        <div className="ficha-datos">
          <h1>{estudiante.nombre}</h1>
          <p className="suave-txt">
            {estudiante.correo} · Cálculo I, grupo 03
          </p>
          <span className="suave-txt">
            Última actividad: {formatearFecha(ultimaActividad)}
          </span>
        </div>

        <div className="ficha-nota">
          <span className="mini-label">Promedio</span>
          <span
            className="nota-grande"
            style={{ fontSize: '30px' }}
          >
            {estudiante.promedio != null
              ? Number(estudiante.promedio).toFixed(1)
              : '—'}
          </span>
        </div>
      </div>

      <div className="fila-3">
        <div className="tarjeta">
          <span className="mini-label">Progreso del curso</span>
          <span className="mini-num">
            {pct}<small> %</small>
          </span>
          <div className="barra-simple">
            <i style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="tarjeta">
          <span className="mini-label">Temas completados</span>
          <span className="mini-num">
            {estudiante.temasVisitados} de {estudiante.totalTemas}
          </span>
        </div>

        <div className="tarjeta">
          <span className="mini-label">Videos vistos</span>
          <span className="mini-num">{estudiante.videosVistos}</span>
        </div>
      </div>

      <div className="cabeza-fila">
        <h2>Avance por unidad</h2>
      </div>

      <div className="fila-3">
        {estudiante.porModulo.map((unidad) => (
          <div key={unidad.id} className="tarjeta unidad-prog">
            <Anillo pct={unidad.pct} />
            <span className="unidad-nombre">{unidad.nombre}</span>
            <small className="suave-txt">{unidad.temas}</small>
            <small className="suave-txt">
              {unidad.sigue}
            </small>
          </div>
        ))}

        {!estudiante.porModulo.length && (
          <div className="tarjeta">
            <span className="suave-txt">
              No hay información de unidades disponible.
            </span>
          </div>
        )}
      </div>

      <div className="tarjeta">
        <div className="cabeza-fila">
          <h2>Entregas y notas</h2>
          <span className="suave-txt">
            {estudiante.entregas} entregadas
          </span>
        </div>

        <ul className="lista">
          {estudiante.notas.map((n) => (
            <li key={n.id} className="item">
              <span className="item-icono">
                {(n.tipo || 'Q').slice(0, 1)}
              </span>

              <span className="item-txt">
                <b>{n.titulo}</b>
                <span>{n.tipo || 'Quiz'}</span>
                <small className="suave-txt">
                  {formatearFecha(n.fechaRespuesta)}
                  {n.aciertos != null && n.totalPreguntas != null
                    ? ` · ${n.aciertos} de ${n.totalPreguntas} respuestas correctas`
                    : ''}
                </small>
              </span>

              {n.nota != null && (
                <span className="nota-grande">
                  {Number(n.nota).toFixed(1)}
                </span>
              )}

              <span className="estado" data-e="activo">
                Calificado
              </span>
            </li>
          ))}

          {!estudiante.notas.length && (
            <li className="item">
              <span className="suave-txt">
                Este estudiante todavía no tiene notas registradas.
              </span>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
