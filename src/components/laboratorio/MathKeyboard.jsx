import { useRef, useState } from 'react';

/**
 * Teclado matemático flotante, al estilo del de GeoGebra:
 * pestañas arriba, un bloque de funciones a la izquierda y el teclado
 * numérico con las acciones a la derecha. Se arrastra desde la cabecera.
 */

/** Bloque izquierdo: cambia según la pestaña. */
const BLOQUE_SIMBOLOS = [
  { et: '(', ins: '(' },
  { et: ')', ins: ')' },
  { et: 'x²', ins: '^2', tipo: 'op' },
  { et: 'xⁿ', ins: '^', tipo: 'op' },
  { et: '√', ins: 'sqrt()', retroceder: 1, tipo: 'fn' },
  { et: '∛', ins: 'cbrt()', retroceder: 1, tipo: 'fn' },
  { et: 'π', ins: 'pi', tipo: 'var' },
  { et: 'e', ins: 'e', tipo: 'var' },
  { et: '∞', ins: 'Infinity', tipo: 'var' },
  { et: '|x|', ins: 'abs()', retroceder: 1, tipo: 'fn' },
  { et: '1/x', ins: '1/x', tipo: 'op' },
  { et: 'x!', ins: '!', tipo: 'op' },
];

const BLOQUE_FUNCIONES = [
  { et: 'sen', ins: 'sin()', retroceder: 1, tipo: 'fn' },
  { et: 'cos', ins: 'cos()', retroceder: 1, tipo: 'fn' },
  { et: 'tg', ins: 'tan()', retroceder: 1, tipo: 'fn' },
  { et: 'sen⁻¹', ins: 'asin()', retroceder: 1, tipo: 'fn' },
  { et: 'cos⁻¹', ins: 'acos()', retroceder: 1, tipo: 'fn' },
  { et: 'tg⁻¹', ins: 'atan()', retroceder: 1, tipo: 'fn' },
  { et: 'ln', ins: 'ln()', retroceder: 1, tipo: 'fn' },
  { et: 'log₁₀', ins: 'log()', retroceder: 1, tipo: 'fn' },
  { et: 'eˣ', ins: 'e^()', retroceder: 1, tipo: 'fn' },
  { et: 'senh', ins: 'sinh()', retroceder: 1, tipo: 'fn' },
  { et: 'cosh', ins: 'cosh()', retroceder: 1, tipo: 'fn' },
  { et: 'tanh', ins: 'tanh()', retroceder: 1, tipo: 'fn' },
];

/** Bloque derecho: numérico + acciones. Es el mismo en las dos pestañas. */
const BLOQUE_NUMERICO = [
  { et: '7', ins: '7' }, { et: '8', ins: '8' }, { et: '9', ins: '9' },
  { et: '÷', ins: '/', tipo: 'op' }, { et: '⌫', accion: 'borrar', tipo: 'accion' },
  { et: '4', ins: '4' }, { et: '5', ins: '5' }, { et: '6', ins: '6' },
  { et: '×', ins: '*', tipo: 'op' }, { et: '‹', accion: 'izquierda', tipo: 'accion' },
  { et: '1', ins: '1' }, { et: '2', ins: '2' }, { et: '3', ins: '3' },
  { et: '−', ins: '-', tipo: 'op' }, { et: '›', accion: 'derecha', tipo: 'accion' },
  { et: '0', ins: '0' }, { et: '.', ins: '.' }, { et: 'x', ins: 'x', tipo: 'var' },
  { et: '+', ins: '+', tipo: 'op' }, { et: '↵', accion: 'graficar', tipo: 'enter' },
];

export default function MathKeyboard({ onInsertar, onBorrar, onLimpiar, onMover, onGraficar }) {
  const [grupo, setGrupo] = useState('basico');
  const [minimizado, setMinimizado] = useState(false);
  const [posicion, setPosicion] = useState(null);

  const cajaRef = useRef(null);
  const arrastreRef = useRef(null);

  const pulsar = (tecla) => {
    switch (tecla.accion) {
      case 'borrar': return onBorrar();
      case 'izquierda': return onMover(-1);
      case 'derecha': return onMover(1);
      case 'graficar': return onGraficar();
      default: return onInsertar(tecla.ins, tecla.retroceder || 0);
    }
  };

  /* ---------- arrastre desde la cabecera ---------- */
  const alBajarPuntero = (evento) => {
    const caja = cajaRef.current;
    if (!caja) return;
    const recto = caja.getBoundingClientRect();
    arrastreRef.current = {
      dx: evento.clientX - recto.left,
      dy: evento.clientY - recto.top,
      ancho: recto.width,
      alto: recto.height,
    };
    try {
      evento.currentTarget.setPointerCapture(evento.pointerId);
    } catch {
      // Puntero sintético: se ignora.
    }
  };

  const alMoverPuntero = (evento) => {
    const arrastre = arrastreRef.current;
    if (!arrastre) return;
    const entre = (valor, max) => Math.min(Math.max(valor, 8), Math.max(8, max));
    setPosicion({
      x: entre(evento.clientX - arrastre.dx, window.innerWidth - arrastre.ancho - 8),
      y: entre(evento.clientY - arrastre.dy, window.innerHeight - arrastre.alto - 8),
    });
  };

  const alSoltarPuntero = () => {
    arrastreRef.current = null;
  };

  // Sin arrastrar, la caja queda centrada bajo la gráfica (posición del CSS).
  const estilo = posicion
    ? { left: `${posicion.x}px`, top: `${posicion.y}px`, right: 'auto', bottom: 'auto', transform: 'none' }
    : undefined;

  if (minimizado) {
    return (
      <button
        type="button"
        className="lab-teclado-abrir"
        style={estilo}
        onClick={() => setMinimizado(false)}
        title="Mostrar teclado matemático"
      >
        ⌨
      </button>
    );
  }

  const bloqueIzquierdo = grupo === 'basico' ? BLOQUE_SIMBOLOS : BLOQUE_FUNCIONES;

  return (
    <div className="lab-teclado" ref={cajaRef} style={estilo}>
      <div
        className="lab-teclado-cabecera"
        onPointerDown={alBajarPuntero}
        onPointerMove={alMoverPuntero}
        onPointerUp={alSoltarPuntero}
        onPointerCancel={alSoltarPuntero}
      >
        <div className="lab-teclado-tabs">
          <button
            type="button"
            className={grupo === 'basico' ? 'activo' : ''}
            onClick={() => setGrupo('basico')}
          >
            123
          </button>
          <button
            type="button"
            className={grupo === 'funciones' ? 'activo' : ''}
            onClick={() => setGrupo('funciones')}
          >
            f(x)
          </button>
        </div>

        <span className="lab-teclado-agarre" aria-hidden="true">⠿</span>

        <button type="button" className="lab-teclado-icono" onClick={onLimpiar} title="Vaciar la ecuación">
          C
        </button>
        <button
          type="button"
          className="lab-teclado-icono"
          onClick={() => setMinimizado(true)}
          title="Minimizar teclado"
        >
          −
        </button>
      </div>

      <div className="lab-teclado-cuerpo">
        <div className="lab-teclado-bloque bloque-izq">
          {bloqueIzquierdo.map((tecla, i) => (
            <Tecla key={`i-${i}`} tecla={tecla} onPulsar={pulsar} />
          ))}
        </div>
        <div className="lab-teclado-bloque bloque-der">
          {BLOQUE_NUMERICO.map((tecla, i) => (
            <Tecla key={`d-${i}`} tecla={tecla} onPulsar={pulsar} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Tecla({ tecla, onPulsar }) {
  return (
    <button
      type="button"
      className={`lab-tecla lab-tecla-${tecla.tipo || 'num'}`}
      onClick={() => onPulsar(tecla)}
      tabIndex={-1}
    >
      {tecla.et}
    </button>
  );
}
