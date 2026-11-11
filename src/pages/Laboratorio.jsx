import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EntradaFuncion from '../components/laboratorio/EntradaFuncion';
import ListaFunciones from '../components/laboratorio/ListaFunciones';
import PanelHerramientas from '../components/laboratorio/PanelHerramientas';
import PlotCanvas from '../components/laboratorio/PlotCanvas';
import { calcularHerramienta } from '../components/laboratorio/herramientas';
import {
  COLORES,
  crearFuncion,
  formatearValor,
  vistaInicial,
} from '../components/laboratorio/mathUtils';
import { resolverConIA } from '../services/openaiService';
import { useSesion } from '../context/sesion';
import { alerta, alertaError } from '../services/alertas';
import {
  guardarEjercicioGuardado,
  obtenerEjercicioGuardado,
} from '../services/ejercicioGuardadoService';
import '../components/laboratorio/laboratorio.css';

/** Ancho aproximado del plano al abrir, para elegir la escala inicial. */
function anchoEstimado() {
  if (typeof window === 'undefined') return 900;
  return window.innerWidth > 900 ? Math.min(1200, window.innerWidth - 400) : window.innerWidth - 32;
}

/**
 * Estado de arranque. Si la página se abrió desde un tema, la URL trae la
 * función (`fn`), la herramienta (`modo`) y el punto de análisis (`a`).
 */
function estadoInicial(params) {
  const modoUrl = params.get('modo');
  const fnUrl = params.get('fn');

  let funciones = [];
  if (fnUrl) {
    const creada = crearFuncion(fnUrl, 0, 1);
    if (creada.ok) funciones = [creada.funcion];
  }

  return {
    funciones,
    activaId: funciones[0]?.id ?? null,
    contador: funciones.length,
    herramienta: modoUrl === 'derivada' || modoUrl === 'limite' ? modoUrl : 'limite',
    punto: params.get('a') || '2',
    vista: vistaInicial(anchoEstimado()),
  };
}

export default function Laboratorio() {
  const { usuario } = useSesion();
  const [params] = useSearchParams();
  const [inicial] = useState(() => estadoInicial(params));

  const [funciones, setFunciones] = useState(inicial.funciones);
  const [activaId, setActivaId] = useState(inicial.activaId);
  const [entrada, setEntrada] = useState('');
  const [errorEntrada, setErrorEntrada] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [contador, setContador] = useState(inicial.contador);

  const [vista, setVista] = useState(inicial.vista);
  const [herramienta, setHerramienta] = useState(inicial.herramienta);
  const [punto, setPunto] = useState(inicial.punto);
  const [incremento, setIncremento] = useState('0.5');
  const [ia, setIA] = useState({ cargando: false, texto: '', error: '' });
  const [panelMovil, setPanelMovil] = useState(true);

  // Ejercicio guardado
  const [ejercicioGuardadoId, setEjercicioGuardadoId] = useState(null);
  const [ejercicioGuardadoNombre, setEjercicioGuardadoNombre] = useState('');
  const [modalGuardar, setModalGuardar] = useState(false);
  const [nombreGuardar, setNombreGuardar] = useState('');
  const [guardando, setGuardando] = useState(false);

  const ejercicioIdParam = params.get('ejercicioId') || params.get('id');

  useEffect(() => {
    if (!ejercicioIdParam) return undefined;
    let vigente = true;

    obtenerEjercicioGuardado(ejercicioIdParam)
      .then((ej) => {
        if (!vigente || !ej) return;
        setEjercicioGuardadoId(ej._id);
        setEjercicioGuardadoNombre(ej.nombre || '');

        if (Array.isArray(ej.funciones) && ej.funciones.length > 0) {
          const reconstruidas = [];
          for (let i = 0; i < ej.funciones.length; i += 1) {
            const item = ej.funciones[i];
            const entradaStr = typeof item === 'string' ? item : item.entrada;
            if (entradaStr) {
              const res = crearFuncion(entradaStr, i, i + 1);
              if (res.ok) {
                reconstruidas.push({
                  ...res.funcion,
                  color: item.color || res.funcion.color,
                  visible: item.visible !== false,
                  nombre: item.nombre || res.funcion.nombre,
                });
              }
            }
          }
          if (reconstruidas.length > 0) {
            setFunciones(reconstruidas);
            setActivaId(reconstruidas[0].id);
            setContador(reconstruidas.length);
          }
        }

        if (ej.herramienta === 'derivada' || ej.herramienta === 'limite') {
          setHerramienta(ej.herramienta);
        }
        if (ej.punto != null) {
          setPunto(String(ej.punto));
        }
        if (ej.incremento != null) {
          setIncremento(String(ej.incremento));
        }
        if (ej.vista && typeof ej.vista === 'object' && ej.vista.xMin != null) {
          setVista(ej.vista);
        }
      })
      .catch((err) => {
        if (vigente) {
          alertaError('No se pudo abrir el ejercicio guardado', err);
        }
      });

    return () => {
      vigente = false;
    };
  }, [ejercicioIdParam]);

  const funcionActiva = useMemo(
    () => funciones.find((f) => f.id === activaId) || null,
    [funciones, activaId],
  );

  /* ---------- alta / edición de funciones ---------- */
  const agregar = useCallback((valor) => {
    if (!valor.trim()) {
      setErrorEntrada('Escribe una función.');
      return false;
    }

    if (editandoId) {
      const original = funciones.find((f) => f.id === editandoId);
      const creada = crearFuncion(valor, 0, 1);
      if (!creada.ok) {
        setErrorEntrada(creada.error);
        return false;
      }
      setFunciones((prev) => prev.map((f) => (
        f.id === editandoId
          ? { ...f, entrada: creada.funcion.entrada, expr: creada.funcion.expr, tex: creada.funcion.tex, evaluar: creada.funcion.evaluar }
          : f
      )));
      setEditandoId(null);
      setEntrada('');
      setErrorEntrada('');
      setActivaId(original?.id ?? null);
      return true;
    }

    const creada = crearFuncion(valor, contador, contador + 1);
    if (!creada.ok) {
      setErrorEntrada(creada.error);
      return false;
    }
    setFunciones((prev) => [...prev, creada.funcion]);
    setActivaId(creada.funcion.id);
    setContador((c) => c + 1);
    setEntrada('');
    setErrorEntrada('');
    setIA({ cargando: false, texto: '', error: '' });
    return true;
  }, [contador, editandoId, funciones]);

  const eliminar = (id) => {
    setFunciones((prev) => prev.filter((f) => f.id !== id));
    if (activaId === id) setActivaId(null);
    if (editandoId === id) {
      setEditandoId(null);
      setEntrada('');
    }
  };

  const alternarVisible = (id) => {
    setFunciones((prev) => prev.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)));
  };

  const editar = (id) => {
    const f = funciones.find((x) => x.id === id);
    if (!f) return;
    setEditandoId(id);
    setActivaId(id);
    setEntrada(f.entrada);
    setErrorEntrada('');
  };

  /* ---------- análisis de la función activa ---------- */
  const { resultado, marcadores } = useMemo(
    () => calcularHerramienta({ funcion: funcionActiva, herramienta, punto, h: incremento }),
    [funcionActiva, herramienta, punto, incremento],
  );

  const marcadoresVisibles = funcionActiva?.visible ? marcadores : {};

  /* ---------- IA paso a paso ---------- */
  const pedirIA = useCallback(async () => {
    if (!funcionActiva) return;
    setIA({ cargando: true, texto: '', error: '' });
    const modo = herramienta === 'derivada' ? 'derivada' : 'limite';
    const res = await resolverConIA(modo, {
      fn: funcionActiva.entrada,
      a: punto,
      x0: punto,
      h: incremento,
    });
    if (res.ok) {
      setIA({ cargando: false, texto: res.respuesta, error: '' });
    } else {
      setIA({
        cargando: false,
        texto: '',
        error: res.error === 'NO_API_KEY'
          ? 'Configura VITE_OPENAI_API_KEY en el archivo .env para usar la explicación con IA.'
          : res.error,
      });
    }
  }, [funcionActiva, herramienta, punto, incremento]);

  /* ---------- clic sobre la curva ---------- */
  const fijarPunto = useCallback((x) => {
    if (!herramienta) return;
    setPunto(formatearValor(x, 4));
  }, [herramienta]);

  const nombreSiguiente = editandoId
    ? (funciones.find((f) => f.id === editandoId)?.nombre ?? 'f_{1}')
    : `f_{${contador + 1}}`;
  const colorSiguiente = editandoId
    ? (funciones.find((f) => f.id === editandoId)?.color ?? COLORES[0])
    : COLORES[contador % COLORES.length];

  const temaTitulo = params.get('tema');
  const ejercicio = params.get('ejercicio');
  // Solo rutas propias: el enlace de volver no debe poder sacar a nadie de la app.
  const volver = params.get('volver');
  const temaRuta = volver?.startsWith('/') && !volver.startsWith('//') ? volver : null;

  const abrirModalGuardar = () => {
    if (!usuario) {
      alerta.aviso('Inicia sesión', 'Debes iniciar sesión para guardar tus ejercicios en el laboratorio.');
      return;
    }
    const conEntrada = funciones.filter((f) => f.entrada && f.entrada.trim());
    if (conEntrada.length === 0) {
      alerta.aviso('Nada que guardar', 'Grafica al menos una función antes de guardar el ejercicio.');
      return;
    }
    setNombreGuardar(ejercicioGuardadoNombre || conEntrada[0].entrada || 'Mi ejercicio');
    setModalGuardar(true);
  };

  const ejecutarGuardar = async (e) => {
    if (e) e.preventDefault();
    const conEntrada = funciones.filter((f) => f.entrada && f.entrada.trim());
    if (conEntrada.length === 0) {
      alerta.aviso('Nada que guardar', 'Grafica al menos una función antes de guardar el ejercicio.');
      setModalGuardar(false);
      return;
    }
    const nombreFinal = nombreGuardar.trim() || conEntrada[0].entrada || 'Mi ejercicio';
    setGuardando(true);

    try {
      const funcionesLimpias = conEntrada.map((f, idx) => ({
        id: idx + 1,
        entrada: f.entrada,
        color: f.color || COLORES[idx % COLORES.length],
        visible: f.visible !== false,
        nombre: f.nombre || `f_{${idx + 1}}`,
      }));

      const res = await guardarEjercicioGuardado({
        id: ejercicioGuardadoId,
        nombre: nombreFinal,
        funciones: funcionesLimpias,
        herramienta: herramienta === 'derivada' ? 'derivada' : 'limite',
        punto: String(punto ?? '0'),
        incremento: String(incremento ?? '0.5'),
        vista,
      });

      if (res?.ejercicio?._id) {
        setEjercicioGuardadoId(res.ejercicio._id);
        setEjercicioGuardadoNombre(res.ejercicio.nombre);
      }
      setModalGuardar(false);
      alerta.ok('Ejercicio guardado', 'Podrás reabrirlo cuando quieras desde tu espacio de estudiante.');
    } catch (err) {
      alertaError('No se pudo guardar el ejercicio', err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="lab-pagina">
      <header className="lab-cabecera">
        <Link to={temaRuta || '/calculo1'} className="boton-volver">
          <span aria-hidden="true">←</span>
          {temaRuta ? 'Volver al tema' : 'Volver a Cálculo I'}
        </Link>
        {temaTitulo && <span className="lab-cabecera-tema">{temaTitulo}</span>}
        {ejercicio && <span className="lab-cabecera-ejercicio"><b>Ejercicio:</b> {ejercicio}</span>}
        {ejercicioGuardadoNombre && (
          <span className="lab-cabecera-ejercicio"><b>Guardado:</b> {ejercicioGuardadoNombre}</span>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="pnl-btn pnl-btn-primario pnl-btn-chico"
            onClick={abrirModalGuardar}
          >
            Guardar ejercicio
          </button>
        </div>
      </header>

      <div className={`lab-cuerpo ${panelMovil ? '' : 'panel-cerrado'}`}>
        <aside className="lab-lateral">
          {/* Las ecuaciones se escriben arriba del todo, como en GeoGebra. */}
          <EntradaFuncion
            valor={entrada}
            onValor={(v) => { setEntrada(v); setErrorEntrada(''); }}
            onEnviar={agregar}
            error={errorEntrada}
            nombre={nombreSiguiente}
            editando={Boolean(editandoId)}
            onCancelarEdicion={() => { setEditandoId(null); setEntrada(''); setErrorEntrada(''); }}
          />

          <section className="lab-seccion">
            <h2 className="lab-seccion-titulo">
              Funciones
              <span className="lab-contador">{funciones.length}</span>
            </h2>
            <ListaFunciones
              funciones={funciones}
              activaId={activaId}
              onSeleccionar={setActivaId}
              onAlternarVisible={alternarVisible}
              onEditar={editar}
              onEliminar={eliminar}
            />
          </section>

          <section className="lab-seccion">
            <h2 className="lab-seccion-titulo">Análisis</h2>
            <PanelHerramientas
              funcion={funcionActiva}
              herramienta={herramienta}
              onHerramienta={(h) => { setHerramienta(h); setIA({ cargando: false, texto: '', error: '' }); }}
              punto={punto}
              onPunto={setPunto}
              incremento={incremento}
              onIncremento={setIncremento}
              resultado={resultado}
              ia={ia}
              onIA={pedirIA}
            />
          </section>
        </aside>

        <main className="lab-plano" style={{ '--color-siguiente': colorSiguiente }}>
          <PlotCanvas
            funciones={funciones}
            vista={vista}
            onVista={setVista}
            marcadores={marcadoresVisibles}
            funcionActiva={funcionActiva}
            onClickPunto={fijarPunto}
          />
        </main>

        <button
          type="button"
          className="lab-toggle-panel"
          onClick={() => setPanelMovil((v) => !v)}
        >
          {panelMovil ? 'Ocultar panel' : 'Mostrar panel'}
        </button>
      </div>

      {modalGuardar && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !guardando) setModalGuardar(false);
          }}
        >
          <div className="tarjeta" style={{ maxWidth: 420, width: '100%', gap: '14px', background: '#fff' }}>
            <div className="cabeza-fila">
              <h2 style={{ margin: 0, fontSize: 18 }}>Guardar ejercicio</h2>
              <button
                type="button"
                className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                onClick={() => setModalGuardar(false)}
                disabled={guardando}
              >
                Cerrar
              </button>
            </div>
            <p className="suave-txt" style={{ margin: 0 }}>
              Guarda tus funciones y herramientas actuales para retomarlas en tu espacio de estudiante.
            </p>
            <form onSubmit={ejecutarGuardar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label htmlFor="nombre-ejercicio" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600 }}>
                Nombre del ejercicio
                <input
                  id="nombre-ejercicio"
                  type="text"
                  maxLength={100}
                  value={nombreGuardar}
                  onChange={(e) => setNombreGuardar(e.target.value)}
                  placeholder="Ej. Límites con funciones racionales"
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 14,
                  }}
                  autoFocus
                />
              </label>
              <div className="acciones" style={{ justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="button"
                  className="pnl-btn pnl-btn-secundario pnl-btn-chico"
                  onClick={() => setModalGuardar(false)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="pnl-btn pnl-btn-primario pnl-btn-chico"
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
