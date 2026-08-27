import { useCallback, useMemo, useState } from 'react';
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
  const temaRuta = params.get('volver');

  return (
    <div className="lab-pagina">
      <header className="lab-cabecera">
        <Link to={temaRuta || '/calculo1'} className="lab-btn-volver">
          <span aria-hidden="true">←</span>
          {temaRuta ? 'Volver al tema' : 'Volver a Cálculo I'}
        </Link>
        {temaTitulo && <span className="lab-cabecera-tema">{temaTitulo}</span>}
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
    </div>
  );
}
