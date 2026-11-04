import { useCallback, useDeferredValue, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiExternalLink } from 'react-icons/fi';
import { alerta, alertaDeshacer, alertaError, cerrarAlerta } from '../../services/alertas';
import { api } from '../../services/api';
import NoEncontrado from '../../pages/NoEncontrado';
import TemaVideo from '../TemaVideo';
import ContenidoTema from '../tema/ContenidoTema';
import PracticaLaboratorio from '../tema/PracticaLaboratorio';
import { errorPracticas, errorVideos, primerError } from './bloquesEditor';
import ListaBloques from './ListaBloques';
import { EditorPracticas, EditorVideos } from './RecursosTema';

const ESPERA_AUTOGUARDADO_MS = 1500;

const ruta = (modulo, numero) => `/admin/temas/${encodeURIComponent(modulo)}/${encodeURIComponent(numero)}`;

const fecha = (valor) => new Date(valor).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

/**
 * Editor de un tema. Los cambios se guardan solos como borrador: el estudiante
 * sigue viendo lo publicado hasta que el administrador pulse Publicar.
 */
export default function EditorTema({ modulo, numero }) {
  const [estado, setEstado] = useState('cargando');
  const [tema, setTema] = useState(null);
  const [datos, setDatos] = useState(null);
  const [sucio, setSucio] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [confirmarDescarte, setConfirmarDescarte] = useState(false);
  const [versiones, setVersiones] = useState(null);

  // Evita que una respuesta lenta marque como guardado algo que ya cambió.
  const edicion = useRef(0);
  const alertaBorrado = useRef(null);

  const diferida = useDeferredValue(datos);
  const vista = diferida ?? datos;
  const problema = datos
    ? primerError(datos.bloques) ?? errorVideos(datos.videos) ?? errorPracticas(datos.practicas)
    : null;

  const aplicar = useCallback((respuesta) => {
    const { titulo, descripcion, bloques, videos = [], practicas = [] } = respuesta;
    edicion.current += 1;
    setTema(respuesta);
    setDatos({ titulo, descripcion, bloques, videos, practicas });
    setSucio(false);
  }, []);

  useEffect(() => {
    let vigente = true;

    api(ruta(modulo, numero))
      .then((respuesta) => {
        if (!vigente) return;
        aplicar(respuesta);
        setEstado('listo');
      })
      .catch((e) => {
        if (vigente) setEstado(e.estado === 404 ? 'no-existe' : 'error');
      });

    return () => {
      vigente = false;
    };
  }, [modulo, numero, aplicar]);

  const editar = (parche) => {
    edicion.current += 1;
    setDatos((actual) => ({ ...actual, ...parche }));
    setSucio(true);
  };

  /** Si la lista se acorta, ofrece volver a la anterior para deshacer el borrado. */
  const cambiarLista = (campo, lista) => {
    const previa = datos[campo];

    if (lista.length < previa.length) {
      alertaBorrado.current = alertaDeshacer('Elemento eliminado', 'Puedes recuperarlo unos segundos.', () => editar({ [campo]: previa }));
    }

    editar({ [campo]: lista });
  };

  // Fuera del editor el botón Deshacer ya no tendría sobre qué actuar.
  useEffect(() => () => {
    if (alertaBorrado.current) cerrarAlerta(alertaBorrado.current);
  }, []);

  const guardar = useCallback(async () => {
    const enviada = edicion.current;
    setGuardando(true);

    try {
      const respuesta = await api(ruta(modulo, numero), { metodo: 'PUT', cuerpo: datos });
      setTema(respuesta);
      if (edicion.current === enviada) setSucio(false);
      return true;
    } catch (e) {
      alertaError('No se pudo guardar el borrador', e);
      return false;
    } finally {
      setGuardando(false);
    }
  }, [datos, modulo, numero]);

  useEffect(() => {
    if (!sucio || problema) return undefined;
    const espera = setTimeout(guardar, ESPERA_AUTOGUARDADO_MS);
    return () => clearTimeout(espera);
  }, [sucio, problema, guardar]);

  // Con la misma espera del autoguardado, para no alertar en cada tecla.
  useEffect(() => {
    if (!sucio || !problema) return undefined;
    const espera = setTimeout(() => alerta.aviso('Cambios sin guardar', problema), ESPERA_AUTOGUARDADO_MS);
    return () => clearTimeout(espera);
  }, [sucio, problema]);

  useEffect(() => {
    if (!sucio) return undefined;

    const avisar = (evento) => {
      evento.preventDefault();
    };

    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [sucio]);

  const publicar = async () => {
    if (problema) {
      alerta.aviso('Revisa el tema antes de publicar', problema);
      return;
    }

    setGuardando(true);

    try {
      if (sucio && !(await guardar())) return;
      aplicar(await api(`${ruta(modulo, numero)}/publicar`, { metodo: 'POST' }));
      setVersiones(null);
      alerta.ok('Tema publicado', 'Los estudiantes ya ven esta versión.');
    } catch (e) {
      alertaError('No se pudo publicar el tema', e);
    } finally {
      setGuardando(false);
    }
  };

  const descartar = async () => {
    setConfirmarDescarte(false);

    try {
      aplicar(await api(`${ruta(modulo, numero)}/borrador`, { metodo: 'DELETE' }));
      alerta.info('Borrador descartado');
    } catch (e) {
      alertaError('No se pudo descartar el borrador', e);
    }
  };

  const abrirHistorial = async (evento) => {
    if (!evento.target.open || versiones) return;

    try {
      const respuesta = await api(`${ruta(modulo, numero)}/versiones`);
      setVersiones(respuesta.versiones);
    } catch (e) {
      alertaError('No se pudo cargar el historial', e);
    }
  };

  const restaurar = async (version) => {
    try {
      aplicar(await api(`${ruta(modulo, numero)}/versiones/${version}/restaurar`, { metodo: 'POST' }));
      alerta.info(`Versión ${version} restaurada`, 'Quedó como borrador. Revísala y publícala.');
    } catch (e) {
      alertaError('No se pudo restaurar la versión', e);
    }
  };

  if (estado === 'no-existe') {
    return <NoEncontrado titulo="Tema no encontrado" mensaje="Ese tema no existe en este módulo." destino="/admin/modulos" textoDestino="Volver a Módulos" />;
  }

  if (estado === 'error') {
    return <div className="aviso-caja" role="alert">No se pudo cargar el tema. Comprueba que el backend esté activo.</div>;
  }

  if (estado === 'cargando' || !datos) return <div className="sesion-espera" role="status">Cargando el tema…</div>;

  const hayBorrador = tema.tieneBorrador || sucio;
  const estadoGuardado = guardando
    ? 'Guardando…'
    : sucio
      ? (problema ? 'Sin guardar' : 'Cambios sin guardar')
      : hayBorrador ? 'Borrador guardado' : 'Sin cambios';

  return (
    <>
      <Link className="boton-volver" to={`/admin/modulos/${modulo}`}><FiArrowLeft />Volver al módulo</Link>

      <div className="editor-barra">
        <div>
          <h1>Tema {numero}</h1>
          <p>
            <span className={`pastilla ${hayBorrador ? 'pastilla-borrador' : 'pastilla-ok'}`}>
              {hayBorrador ? 'Borrador sin publicar' : `Publicado · versión ${tema.version}`}
            </span>
            <span className="suave-txt" role="status">{estadoGuardado}</span>
          </p>
        </div>
        <div className="admin-acciones">
          <Link className="pnl-btn pnl-btn-secundario pnl-btn-chico" to={`/calculo1/${modulo}/${numero}`} target="_blank"><FiExternalLink />Ver publicado</Link>
          {tema.tieneBorrador && !confirmarDescarte && (
            <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={() => setConfirmarDescarte(true)}>Descartar borrador</button>
          )}
          {confirmarDescarte && (
            <>
              <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={() => setConfirmarDescarte(false)}>Conservar</button>
              <button type="button" className="pnl-btn pnl-btn-peligro pnl-btn-chico" onClick={descartar}>Sí, descartar</button>
            </>
          )}
          <button type="button" className="pnl-btn pnl-btn-primario" disabled={guardando || !hayBorrador} onClick={publicar}>Publicar</button>
        </div>
      </div>

      <div className="editor">
        <section className="editor-columna" aria-label="Edición">
          <div className="tarjeta">
            <div className="campo">
              <label htmlFor="editor-titulo">Título</label>
              <input id="editor-titulo" value={datos.titulo} onChange={(e) => editar({ titulo: e.target.value })} />
            </div>
            <div className="campo">
              <label htmlFor="editor-descripcion">Descripción</label>
              <textarea id="editor-descripcion" rows={2} value={datos.descripcion} onChange={(e) => editar({ descripcion: e.target.value })} />
            </div>
          </div>

          <ListaBloques bloques={datos.bloques} cambiar={(lista) => cambiarLista('bloques', lista)} />

          <EditorVideos videos={datos.videos} cambiar={(lista) => cambiarLista('videos', lista)} />
          <EditorPracticas
            practicas={datos.practicas}
            cambiar={(lista) => cambiarLista('practicas', lista)}
            herramienta={modulo === 'limites' ? 'limite' : 'derivada'}
          />

          <details className="tarjeta editor-historial" onToggle={abrirHistorial}>
            <summary>Historial de versiones</summary>
            {versiones === null && <p className="suave-txt">Cargando…</p>}
            {versiones?.length === 0 && <p className="suave-txt">Todavía no hay versiones anteriores. Se crea una cada vez que publicas.</p>}
            {versiones?.length > 0 && (
              <ul className="lista">
                {versiones.map((v) => (
                  <li key={v.version} className="item">
                    <span className="item-txt">
                      <b>Versión {v.version}</b>
                      <span>{fecha(v.createdAt)}{v.publicadoPor ? ` · ${v.publicadoPor}` : ''}</span>
                    </span>
                    <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={() => restaurar(v.version)}>Restaurar</button>
                  </li>
                ))}
              </ul>
            )}
          </details>
        </section>

        <section className="editor-columna editor-vista" aria-label="Vista previa">
          <span className="editor-vista-rotulo">Vista previa</span>
          <h2>{vista.titulo}</h2>
          <p className="suave-txt">{vista.descripcion}</p>
          {/* En captura: así los enlaces de la vista previa no sacan del editor. */}
          <div className="editor-vista-cuerpo" onClickCapture={(e) => { if (e.target.closest('a')) e.preventDefault(); }}>
            <ContenidoTema bloques={vista.bloques} />
            <TemaVideo key={vista.videos[0]?.id} videos={vista.videos} sinAviso />
            <PracticaLaboratorio
              titulo={vista.titulo}
              modo={modulo === 'limites' ? 'limite' : 'derivada'}
              unidadId={modulo}
              temaId={numero}
              practicas={vista.practicas}
            />
          </div>
        </section>
      </div>
    </>
  );
}
