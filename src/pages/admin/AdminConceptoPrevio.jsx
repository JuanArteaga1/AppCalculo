import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave } from 'react-icons/fi';
import { alerta, alertaError } from '../../services/alertas';
import { api } from '../../services/api';
import ListaBloques from '../../components/admin/ListaBloques';
import ContenidoTema from '../../components/tema/ContenidoTema';
import NoEncontrado from '../../pages/NoEncontrado';


function datosIniciales() {
  return {
    titulo: '',
    slug: '',
    orden: 0,
    publicado: false,
    contenido: [],
  };
}

export default function AdminConceptoPrevio({
  id: idProp,
  esNuevo: esNuevoProp,
  onGuardar,
  onCancelar,
}) {
  const { id: idRuta } = useParams();
  const navigate = useNavigate();
  const id = idProp ?? idRuta;
  const esNuevo = esNuevoProp ?? id === 'nuevo';
  const embebido = typeof onGuardar === 'function';

  const [estado, setEstado] = useState(esNuevo ? 'listo' : 'cargando');
  const [formulario, setFormulario] = useState(datosIniciales);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (esNuevo) return undefined;

    let vigente = true;

    api(`/admin/conceptos-previos/${id}`)
      .then((datos) => {
        if (!vigente) return;
        setFormulario({
          titulo: datos.concepto.titulo,
          slug: datos.concepto.slug,
          orden: datos.concepto.orden,
          publicado: datos.concepto.publicado,
          contenido: datos.concepto.contenido ?? [],
        });
        setEstado('listo');
      })
      .catch((error) => {
        if (!vigente) return;
        if (error.estado === 404) {
          setEstado('no-existe');
        } else {
          alertaError('No se pudo cargar el concepto previo', error);
          setEstado('error');
        }
      });

    return () => {
      vigente = false;
    };
  }, [id, esNuevo]);

  const cambiar = (campo, valor) => {
    setFormulario((actual) => ({ ...actual, [campo]: valor }));
  };

  const validar = () => {
    const errores = [];

    if (!formulario.titulo.trim()) {
      errores.push('El título es obligatorio.');
    }

    if (!Number.isFinite(Number(formulario.orden))) {
      errores.push('El orden debe ser un número.');
    }

    return errores;
  };

  const guardar = async () => {
    const errores = validar();

    if (errores.length > 0) {
      alerta.aviso('Revisa los datos', errores.join(' '));
      return;
    }

    setGuardando(true);

    const cuerpo = {
      titulo: formulario.titulo.trim(),
      orden: Number(formulario.orden),
      contenido: formulario.contenido,
      publicado: formulario.publicado,
    };

    try {
      if (esNuevo) {
        await api('/admin/conceptos-previos', { metodo: 'POST', cuerpo });
        alerta.ok('Concepto previo creado');
      } else {
        await api(`/admin/conceptos-previos/${id}`, { metodo: 'PUT', cuerpo });
        alerta.ok('Concepto previo actualizado');
      }

      if (embebido) {
        onGuardar();
      } else {
        navigate('/admin/conceptos-previos');
      }
    } catch (error) {
      alertaError('No se pudo guardar', error);
    } finally {
      setGuardando(false);
    }
  };

  const cancelar = () => {
    if (embebido) {
      onCancelar();
    } else {
      navigate('/admin/conceptos-previos');
    }
  };

  if (estado === 'no-existe') {
    return <NoEncontrado titulo="Concepto no encontrado" mensaje="Ese concepto previo no existe." destino="/admin/conceptos-previos" textoDestino="Volver al listado" />;
  }

  if (estado === 'error') {
    return <div className="aviso-caja" role="alert">No se pudo cargar el concepto previo.</div>;
  }

  return (
    <div className="panel">
      <div className="panel-cabeza">
        <div>
          <button type="button" className="boton-volver" onClick={cancelar}>← Volver al listado</button>
          <h1>{esNuevo ? 'Crear concepto previo' : 'Editar concepto previo'}</h1>
        </div>
        <button
          type="button"
          className="pnl-btn pnl-btn-primario"
          onClick={guardar}
          disabled={guardando}
        >
          <FiSave aria-hidden="true" />
          {guardando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      <div className="fila-2" style={{ alignItems: 'start' }}>
        <div className="tarjeta" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="campo">
            <label htmlFor="titulo">Título</label>
            <input
              id="titulo"
              type="text"
              value={formulario.titulo}
              onChange={(e) => cambiar('titulo', e.target.value)}
              placeholder="Título del concepto previo"
            />
          </div>

          {/* La dirección la arma el servidor con el título al crear y no cambia después. */}
          {!esNuevo && formulario.slug && (
            <p className="campo-ayuda" style={{ margin: 0 }}>
              Dirección pública: <code>/conceptos-previos/{formulario.slug}</code>
            </p>
          )}

          <div className="campo">
            <label htmlFor="orden">Orden</label>
            <input
              id="orden"
              type="number"
              value={formulario.orden}
              onChange={(e) => cambiar('orden', e.target.value)}
            />
          </div>

          <label className="acepto" htmlFor="publicado">
            <input
              id="publicado"
              type="checkbox"
              checked={formulario.publicado}
              onChange={(e) => cambiar('publicado', e.target.checked)}
            />
            <span>Publicado (visible para visitantes)</span>
          </label>

          <div className="campo">
            <label>Contenido</label>
            <ListaBloques
              bloques={formulario.contenido}
              cambiar={(contenido) => cambiar('contenido', contenido)}
            />
          </div>
        </div>

        <div className="tarjeta" style={{ position: 'sticky', top: 24, alignSelf: 'start' }}>
          <h2>Vista previa</h2>
          <div className="tema-lectura">
            <ContenidoTema bloques={formulario.contenido} />
          </div>
        </div>
      </div>
    </div>
  );
}
