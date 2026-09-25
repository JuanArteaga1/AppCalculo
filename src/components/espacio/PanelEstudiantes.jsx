import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import {
  ESTUDIANTES,
  ETIQUETA_SEGUIMIENTO,
  UNIDADES,
  progresoGeneral,
} from '../../data/mockEstudiantes';
import { ETIQUETA_ESTADO } from '../../data/mockEspacio';
import { Anillo } from './PanelesEstudiante';

/**
 * Lista del grupo con el avance de cada estudiante y, al entrar en uno,
 * su perfil completo: progreso por unidad, notas y actividad.
 * Maqueta estática: los datos salen de mockEstudiantes.js.
 */
export default function PanelEstudiantes() {
  const [busqueda, setBusqueda] = useState('');
  const [abierto, setAbierto] = useState(null);

  if (abierto) {
    const estudiante = ESTUDIANTES.find((e) => e.id === abierto);
    return <PerfilEstudiante estudiante={estudiante} onVolver={() => setAbierto(null)} />;
  }

  const termino = busqueda.trim().toLowerCase();
  const lista = termino
    ? ESTUDIANTES.filter((e) => `${e.nombre} ${e.correo}`.toLowerCase().includes(termino))
    : ESTUDIANTES;

  const promedioGrupo = (ESTUDIANTES.reduce((a, e) => a + e.promedio, 0) / ESTUDIANTES.length).toFixed(1);
  const avanceGrupo = Math.round(ESTUDIANTES.reduce((a, e) => a + progresoGeneral(e), 0) / ESTUDIANTES.length);
  const enRiesgo = ESTUDIANTES.filter((e) => e.seguimiento === 'en-riesgo').length;

  return (
    <section className="panel">
      <div className="panel-cabeza">
        <h1>Estudiantes</h1>
        <p>El avance de Cálculo I, grupo 03. Entra a un estudiante para ver su progreso completo.</p>
      </div>

      <div className="fila-3">
        <div className="tarjeta">
          <span className="mini-label">Estudiantes</span>
          <span className="mini-num">{ESTUDIANTES.length}</span>
        </div>
        <div className="tarjeta">
          <span className="mini-label">Avance del grupo</span>
          <span className="mini-num">{avanceGrupo}<small> %</small></span>
          <div className="barra-simple"><i style={{ width: `${avanceGrupo}%` }} /></div>
        </div>
        <div className="tarjeta">
          <span className="mini-label">Promedio · en riesgo</span>
          <span className="mini-num">{promedioGrupo} <small>/ 5.0 · {enRiesgo} en riesgo</small></span>
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
                const pct = progresoGeneral(e);
                const [punto, texto] = ETIQUETA_SEGUIMIENTO[e.seguimiento];
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
                        <div className="barra-simple"><i style={{ width: `${pct}%` }} /></div>
                        <span className="suave-txt">{pct}%</span>
                      </div>
                    </td>
                    <td><b className="nota-grande">{e.promedio.toFixed(1)}</b></td>
                    <td>{e.entregas}</td>
                    <td>
                      <span className="estado" data-e={punto}>{texto}</span>
                      <small className="suave-txt"> · {e.ultimoAcceso}</small>
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
                  <td colSpan={6} className="suave-txt">Ningún estudiante coincide con la búsqueda.</td>
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
  const pct = progresoGeneral(estudiante);
  const [punto, texto] = ETIQUETA_SEGUIMIENTO[estudiante.seguimiento];

  return (
    <section className="panel">
      <button type="button" className="volver" onClick={onVolver}>← Volver a Estudiantes</button>

      <div className="tarjeta ficha-estudiante">
        <span className="lat-avatar ficha-avatar">{estudiante.iniciales}</span>
        <div className="ficha-datos">
          <h1>{estudiante.nombre}</h1>
          <p className="suave-txt">{estudiante.correo} · Cálculo I, grupo 03</p>
          <span className="estado" data-e={punto}>{texto} · última actividad {estudiante.ultimoAcceso}</span>
        </div>
        <div className="ficha-nota">
          <span className="mini-label">Promedio</span>
          <span className="nota-grande" style={{ fontSize: '30px' }}>{estudiante.promedio.toFixed(1)}</span>
        </div>
      </div>

      <div className="fila-3">
        <div className="tarjeta">
          <span className="mini-label">Progreso del curso</span>
          <span className="mini-num">{pct}<small> %</small></span>
          <div className="barra-simple"><i style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="tarjeta">
          <span className="mini-label">Temas completados</span>
          <span className="mini-num">{estudiante.temas}</span>
        </div>
        <div className="tarjeta">
          <span className="mini-label">Videos vistos</span>
          <span className="mini-num">{estudiante.videos}</span>
        </div>
      </div>

      <div className="cabeza-fila">
        <h2>Avance por unidad</h2>
      </div>
      <div className="fila-3">
        {UNIDADES.map(([clave, nombre]) => (
          <div key={clave} className="tarjeta unidad-prog">
            <Anillo pct={estudiante.unidades[clave]} />
            <span className="unidad-nombre">{nombre}</span>
          </div>
        ))}
      </div>

      <div className="tarjeta">
        <div className="cabeza-fila">
          <h2>Entregas y notas</h2>
          <span className="suave-txt">{estudiante.entregas} entregadas</span>
        </div>
        <ul className="lista">
          {estudiante.notas.map((n) => (
            <li key={n.titulo} className="item">
              <span className="item-icono">{n.tipo.slice(0, 1)}</span>
              <span className="item-txt">
                <b>{n.titulo}</b>
                <span>{n.tipo}</span>
              </span>
              {n.nota != null && <span className="nota-grande">{n.nota.toFixed(1)}</span>}
              <span className="estado" data-e={n.estado}>{ETIQUETA_ESTADO[n.estado]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
