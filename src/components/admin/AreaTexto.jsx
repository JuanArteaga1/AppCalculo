import { useEffect, useMemo, useRef, useState } from 'react';
import { FiAlignCenter, FiAlignLeft, FiAlignRight, FiLink } from 'react-icons/fi';
import { TbHeading, TbMathFunction } from 'react-icons/tb';
import MathKeyboard from '../laboratorio/MathKeyboard';
import Tex from '../laboratorio/Tex';
import useCursorTeclado from '../laboratorio/useCursorTeclado';
import '../laboratorio/laboratorio.css';
import { alinearTexto, formulaATex, marcarTitulo, normalizarEnlace, TECLAS_CALCULO } from './herramientasTexto';

const GRUPOS_TECLADO = [{ id: 'calculo', et: 'lím', teclas: TECLAS_CALCULO }];

const ALINEACIONES = [
  ['', 'Alinear a la izquierda', FiAlignLeft],
  ['centro', 'Centrar', FiAlignCenter],
  ['derecha', 'Alinear a la derecha', FiAlignRight],
];

function PanelFormula({ inicial, insertar, cerrar }) {
  const [entrada, setEntrada] = useState(inicial);
  const [aparte, setAparte] = useState(false);
  const { inputRef, insertar: escribir, borrar, mover } = useCursorTeclado(entrada, setEntrada);

  const tex = useMemo(() => formulaATex(entrada), [entrada]);

  const aceptar = () => {
    if (tex) insertar(tex, aparte);
  };

  return (
    <div className="editor-panel-texto editor-formula" role="group" aria-label="Insertar fórmula">
      <input
        ref={inputRef}
        aria-label="Fórmula"
        placeholder="Escribe con el teclado, por ejemplo x^2 - 4"
        value={entrada}
        spellCheck="false"
        autoComplete="off"
        autoFocus
        onChange={(e) => setEntrada(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            aceptar();
          }
          if (e.key === 'Escape') cerrar();
        }}
      />

      <div className="editor-formula-vista" aria-live="polite">
        {tex
          ? <Tex tex={tex} display />
          : <span className="suave-txt">{entrada.trim() ? 'Completa la fórmula para verla aquí.' : 'Aquí verás la fórmula.'}</span>}
      </div>

      <div className="editor-panel-acciones">
        <label className="editor-panel-opcion">
          <input type="checkbox" checked={aparte} onChange={(e) => setAparte(e.target.checked)} />
          En su propio renglón
        </label>
        <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={cerrar}>Cancelar</button>
        <button type="button" className="pnl-btn pnl-btn-primario pnl-btn-chico" disabled={!tex} onClick={aceptar}>Insertar fórmula</button>
      </div>

      <MathKeyboard
        onInsertar={escribir}
        onBorrar={borrar}
        onLimpiar={() => setEntrada('')}
        onMover={mover}
        onGraficar={aceptar}
        gruposExtra={GRUPOS_TECLADO}
      />
    </div>
  );
}

function PanelEnlace({ inicial, insertar, cerrar }) {
  const [texto, setTexto] = useState(inicial);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const aceptar = () => {
    const palabras = texto.replace(/[[\]]/g, '').replace(/\s+/g, ' ').trim();
    const destino = normalizarEnlace(url);

    if (!palabras) {
      setError('Escribe las palabras que llevarán el enlace.');
    } else if (!destino) {
      setError('Ese enlace no es válido. Usa una dirección web o una ruta como /calculo1/limites/1.1.');
    } else {
      insertar(`[${palabras}](${destino})`);
    }
  };

  const alTeclear = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      aceptar();
    }
    if (e.key === 'Escape') cerrar();
  };

  return (
    <div className="editor-panel-texto" role="group" aria-label="Insertar enlace">
      <input
        aria-label="Texto del enlace"
        placeholder="Texto que se verá"
        value={texto}
        autoFocus={!inicial}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={alTeclear}
      />
      <input
        aria-label="Dirección del enlace"
        placeholder="Pega el enlace, por ejemplo https://es.wikipedia.org"
        value={url}
        autoFocus={Boolean(inicial)}
        onChange={(e) => {
          setUrl(e.target.value);
          setError('');
        }}
        onKeyDown={alTeclear}
      />
      {error && <small className="campo-error" role="alert">{error}</small>}

      <div className="editor-panel-acciones">
        <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={cerrar}>Cancelar</button>
        <button type="button" className="pnl-btn pnl-btn-primario pnl-btn-chico" onClick={aceptar}>Insertar enlace</button>
      </div>
    </div>
  );
}

/**
 * Área de texto con botones para no escribir comandos. Con formato suma títulos
 * y alineación, que solo existen en los bloques de texto: enunciados y
 * explicaciones se muestran sin procesar líneas.
 */
export default function AreaTexto({ id, valor, cambiar, filas, formato = false }) {
  const areaRef = useRef(null);
  const cursorPendiente = useRef(null);
  const [panel, setPanel] = useState(null);
  const [seleccion, setSeleccion] = useState('');

  useEffect(() => {
    const rango = cursorPendiente.current;
    if (rango === null || !areaRef.current) return;
    cursorPendiente.current = null;
    areaRef.current.focus();
    areaRef.current.setSelectionRange(...rango);
  });

  const abrir = (nombre) => {
    const area = areaRef.current;
    const elegido = valor.slice(area.selectionStart, area.selectionEnd);

    // Doble clic también toma el espacio de al lado: ese espacio no va en el enlace.
    const inicio = area.selectionStart + elegido.length - elegido.trimStart().length;
    area.setSelectionRange(inicio, inicio + elegido.trim().length);

    setSeleccion(elegido.trim());
    setPanel(panel === nombre ? null : nombre);
  };

  /** Reemplaza lo seleccionado en el área de texto. */
  const insertar = (nuevo) => {
    const { selectionStart: inicio, selectionEnd: fin } = areaRef.current;
    cursorPendiente.current = [inicio + nuevo.length, inicio + nuevo.length];
    cambiar(valor.slice(0, inicio) + nuevo + valor.slice(fin));
    setPanel(null);
  };

  /** Títulos y alineación actúan sobre las líneas donde está el cursor. */
  const aplicar = (transformar, opcion) => {
    const { selectionStart, selectionEnd } = areaRef.current;
    const resultado = transformar(valor, selectionStart, selectionEnd, opcion);

    if (resultado.texto === valor) {
      areaRef.current.focus();
      return;
    }

    cursorPendiente.current = [resultado.inicio, resultado.fin];
    cambiar(resultado.texto);
  };

  const insertarFormula = (tex, aparte) => {
    if (!aparte) {
      insertar(`$${tex}$`);
      return;
    }

    const { selectionStart: inicio, selectionEnd: fin } = areaRef.current;
    const antes = inicio > 0 && valor[inicio - 1] !== '\n' ? '\n' : '';
    const despues = fin < valor.length && valor[fin] !== '\n' ? '\n' : '';
    insertar(`${antes}$$${tex}$$${despues}`);
  };

  return (
    <>
      <div className="editor-herramientas" role="toolbar" aria-label="Herramientas de texto">
        {formato && (
          <>
            <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={() => aplicar(marcarTitulo, '##')}>
              <TbHeading aria-hidden="true" />Título
            </button>
            <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" onClick={() => aplicar(marcarTitulo, '###')}>Subtítulo</button>
            <span className="editor-herramientas-corte" aria-hidden="true" />
            {ALINEACIONES.map(([alineacion, nombre, Icono]) => (
              <button key={nombre} type="button" className="editor-icono" aria-label={nombre} title={nombre} onClick={() => aplicar(alinearTexto, alineacion)}>
                <Icono aria-hidden="true" />
              </button>
            ))}
            <span className="editor-herramientas-corte" aria-hidden="true" />
          </>
        )}
        <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" aria-expanded={panel === 'formula'} onClick={() => abrir('formula')}>
          <TbMathFunction aria-hidden="true" />Fórmula
        </button>
        <button type="button" className="pnl-btn pnl-btn-secundario pnl-btn-chico" aria-expanded={panel === 'enlace'} onClick={() => abrir('enlace')}>
          <FiLink aria-hidden="true" />Enlace
        </button>
      </div>

      {panel === 'formula' && <PanelFormula inicial={seleccion} insertar={insertarFormula} cerrar={() => setPanel(null)} />}
      {panel === 'enlace' && <PanelEnlace inicial={seleccion} insertar={insertar} cerrar={() => setPanel(null)} />}

      <textarea ref={areaRef} id={id} rows={filas} value={valor} onChange={(e) => cambiar(e.target.value)} />
    </>
  );
}
