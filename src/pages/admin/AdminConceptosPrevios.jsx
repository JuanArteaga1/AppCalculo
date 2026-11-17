import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit2, FiPlus, FiToggleLeft, FiToggleRight, FiTrash2 } from 'react-icons/fi';
import { api } from '../../services/api';
import { alerta, alertaError } from '../../services/alertas';

export default function AdminConceptosPrevios({ onCrear, onEditar }) {
  const [conceptos, setConceptos] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const navigate = useNavigate();
  const embebido = typeof onCrear === 'function';

  const irACrear = () => {
    if (embebido) {
      onCrear();
    } else {
      navigate('/admin/conceptos-previos/nuevo');
    }
  };

  const irAEditar = (id) => {
    if (embebido) {
      onEditar(id);
    } else {
      navigate(`/admin/conceptos-previos/${id}`);
    }
  };

  useEffect(() => {
    let vigente = true;

    api('/admin/conceptos-previos')
      .then((datos) => {
        if (!vigente) return;
        setConceptos(datos.conceptos ?? []);
        setEstado('listo');
      })
      .catch((error) => {
        if (!vigente) return;
        alertaError('No se pudieron cargar los conceptos previos', error);
        setEstado('error');
      });

    return () => {
      vigente = false;
    };
  }, []);

  const recargar = async () => {
    setEstado('cargando');

    try {
      const datos = await api('/admin/conceptos-previos');
      setConceptos(datos.conceptos ?? []);
      setEstado('listo');
    } catch (error) {
      alertaError('No se pudieron cargar los conceptos previos', error);
      setEstado('error');
    }
  };

  const cambiarPublicado = async (id, publicado) => {
    try {
      await api(`/admin/conceptos-previos/${id}/publicado`, {
        metodo: 'PATCH',
        cuerpo: { publicado: !publicado },
      });
      alerta.ok(publicado ? 'Concepto oculto' : 'Concepto publicado', publicado ? 'Ya no es visible para los visitantes.' : 'Los visitantes ya pueden verlo.');
      await recargar();
    } catch (error) {
      alertaError('No se pudo cambiar el estado', error);
    }
  };

  const eliminar = async (id, titulo) => {
    const confirmar = window.confirm(`¿Eliminar permanentemente "${titulo}"?`);

    if (!confirmar) return;

    try {
      await api(`/admin/conceptos-previos/${id}`, { metodo: 'DELETE' });
      alerta.ok('Concepto previo eliminado');
      await recargar();
    } catch (error) {
      alertaError('No se pudo eliminar', error);
    }
  };

  if (estado === 'cargando') {
    return <div className="sesion-espera" role="status">Cargando…</div>;
  }

  return (
    <div className="panel">
      <div className="panel-cabeza">
        <div>
          <h1>Conceptos previos</h1>
          <p className="suave-txt">Material de apoyo visible en /conceptos-previos.</p>
        </div>
        <button
          type="button"
          className="pnl-btn pnl-btn-primario"
          onClick={irACrear}
        >
          <FiPlus aria-hidden="true" />
          Crear concepto previo
        </button>
      </div>

      {conceptos.length === 0 ? (
        <div className="aviso-caja" role="status">
          <b>No hay conceptos previos</b>
          <p>Crea el primero para que aparezca en la página pública.</p>
        </div>
      ) : (
        <div className="tarjeta">
          <table className="tabla-panel">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Título</th>
                <th>Slug</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {conceptos.map((c) => (
                <tr key={c.id}>
                  <td>{c.orden}</td>
                  <td>{c.titulo}</td>
                  <td><code>{c.slug}</code></td>
                  <td>
                    <span className={`pastilla ${c.publicado ? 'pastilla-publicado' : 'pastilla-borrador'}`}>
                      {c.publicado ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td>
                    <div className="fila-botones">
                      <button
                        type="button"
                        className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                        onClick={() => irAEditar(c.id)}
                        aria-label="Editar"
                      >
                        <FiEdit2 aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                        onClick={() => cambiarPublicado(c.id, c.publicado)}
                        aria-label={c.publicado ? 'Ocultar' : 'Publicar'}
                      >
                        {c.publicado ? <FiToggleRight aria-hidden="true" /> : <FiToggleLeft aria-hidden="true" />}
                      </button>
                      <button
                        type="button"
                        className="pnl-btn pnl-btn-peligro pnl-btn-chico"
                        onClick={() => eliminar(c.id, c.titulo)}
                        aria-label="Eliminar"
                      >
                        <FiTrash2 aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
