import { useEffect, useRef, useState } from 'react';

const P0 = { x: 70, y: 250 };
const P1 = { x: 250, y: 125 };
const P2 = { x: 430, y: 250 };

function bezierPos(t) {
  const mt = 1 - t;
  return {
    x: mt * mt * P0.x + 2 * mt * t * P1.x + t * t * P2.x,
    y: mt * mt * P0.y + 2 * mt * t * P1.y + t * t * P2.y,
  };
}

function bezierSlope(t) {
  const mt = 1 - t;
  const dx = 2 * mt * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
  const dy = 2 * mt * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
  return dy / dx;
}

function tFromX(targetX) {
  let t = 0.5;
  for (let i = 0; i < 30; i++) {
    const x = bezierPos(t).x;
    if (Math.abs(x - targetX) < 0.1) break;
    const dx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
    t += (targetX - x) / dx * 0.5;
    t = Math.max(0, Math.min(1, t));
  }
  return t;
}

export default function MountainSlopeInteractive() {
  const containerRef = useRef(null);
  const [mouseX, setMouseX] = useState(250);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isNear, setIsNear] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    const svgX = (relX / rect.width) * 500;
    const svgY = (relY / rect.height) * 300;

    const clampedX = Math.max(70, Math.min(430, svgX));
    const t = tFromX(clampedX);
    const curvePoint = bezierPos(t);

    // ¿El mouse está cerca de la curva? (distancia vertical)
    const dist = Math.abs(svgY - curvePoint.y);
    setIsNear(dist < 50);

    setMouseX(clampedX);
  };

  const t = tFromX(mouseX);
  const point = bezierPos(t);
  const slope = bezierSlope(t);
  const mathX = Math.round(point.x);
  const mathY = Math.round(300 - point.y);

  let slopeText = 'Plano';
  let slopeColor = '#F4B400';
  if (slope < -0.25) { slopeText = 'Subiendo rápido ↑'; slopeColor = '#34D399'; }
  else if (slope < -0.06) { slopeText = 'Subiendo ↑'; slopeColor = '#6EE7B7'; }
  else if (slope > 0.25) { slopeText = 'Bajando rápido ↓'; slopeColor = '#F87171'; }
  else if (slope > 0.06) { slopeText = 'Bajando ↓'; slopeColor = '#FCA5A5'; }

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const key = 'mountain-animation-styles';
    if (document.getElementById(key)) return;
    const style = document.createElement('style');
    style.id = key;
    style.textContent = `
      @keyframes drawCurve { from { stroke-dashoffset: 900; } to { stroke-dashoffset: 0; } }
      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(style);
  }, []);

  const toggleExpand = (e) => {
    if (e) e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleBackdropClick = (e) => {
    if (isExpanded && e.target === e.currentTarget) setIsExpanded(false);
  };

  // Puntos del trail (últimas 6 posiciones)
  const trail = [];
  for (let i = 1; i <= 6; i++) {
    const tt = Math.max(0, t - i * 0.03);
    trail.push(bezierPos(tt));
  }

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        ...styles.containerMaster,
        ...(isExpanded ? styles.expandedBackdrop : {})
      }}
    >
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        style={{
          ...styles.wrap,
          ...(isExpanded ? styles.expandedCard : {})
        }}
      >
        <button onClick={toggleExpand} style={styles.expandBtn}>
          {isExpanded ? '✕' : '⛶'}
        </button>

        {!isExpanded && (
          <div style={styles.instruction}>
            acerca el cursor a la línea azul
          </div>
        )}

        <svg
          viewBox="0 0 500 300"
          preserveAspectRatio="xMidYMid meet"
          style={{ ...styles.svg, ...(isExpanded ? styles.svgExpanded : {}) }}
        >
          <defs>
            <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#93C5FD" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="rocketGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Rejilla */}
          {[50, 100, 150, 200, 250, 300, 350, 400, 450].map((x) => (
            <line key={`v${x}`} x1={x} y1="20" x2={x} y2="280" stroke="rgba(255,255,255,0.04)" />
          ))}
          {[50, 100, 150, 200, 250].map((y) => (
            <line key={`h${y}`} x1="20" y1={y} x2="480" y2={y} stroke="rgba(255,255,255,0.04)" />
          ))}

          {/* Curva azul */}
          <path
            d={`M ${P0.x} ${P0.y} Q ${P1.x} ${P1.y} ${P2.x} ${P2.y}`}
            fill="none"
            stroke="url(#mountainGradient)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeDasharray="900"
            strokeDashoffset="900"
            filter="url(#glow)"
            style={{ animation: 'drawCurve 2s ease-out forwards' }}
          />

          {/* Trail del cohete */}
          {isNear && trail.map((pos, i) => (
            <circle
              key={i}
              cx={pos.x}
              cy={pos.y}
              r={3 - i * 0.4}
              fill={slopeColor}
              opacity={0.5 - i * 0.07}
            />
          ))}

          {/* Cohete - solo visible cuando el mouse está cerca */}
          {isNear && (
            <g filter="url(#rocketGlow)">
              {/* Llama */}
              <ellipse cx={point.x} cy={point.y + 14} rx="4" ry="7" fill="#F97316" opacity="0.9">
                <animate attributeName="ry" values="7;4;7" dur="0.25s" repeatCount="indefinite" />
              </ellipse>
              <ellipse cx={point.x} cy={point.y + 12} rx="2.5" ry="4" fill="#FBBF24">
                <animate attributeName="ry" values="4;2;4" dur="0.2s" repeatCount="indefinite" />
              </ellipse>
              {/* Cuerpo */}
              <rect x={point.x - 4} y={point.y - 12} width="8" height="16" rx="4" fill={slopeColor} />
              {/* Ventana */}
              <circle cx={point.x} cy={point.y - 4} r="2" fill="#0b1020" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
              {/* Aletas */}
              <polygon points={`${point.x - 4},${point.y - 2} ${point.x - 8},${point.y + 6} ${point.x - 4},${point.y + 4}`} fill={slopeColor} opacity="0.7" />
              <polygon points={`${point.x + 4},${point.y - 2} ${point.x + 8},${point.y + 6} ${point.x + 4},${point.y + 4}`} fill={slopeColor} opacity="0.7" />
              {/* Punta */}
              <polygon points={`${point.x},${point.y - 16} ${point.x - 3.5},${point.y - 12} ${point.x + 3.5},${point.y - 12}`} fill="#fff" opacity="0.9" />

              {/* Coordenadas */}
              <rect
                x={point.x - 45}
                y={point.y - 36}
                width="90"
                height="18"
                rx="5"
                fill="rgba(11, 16, 32, 0.9)"
                stroke={slopeColor}
                strokeWidth="1"
              />
              <text
                x={point.x}
                y={point.y - 23}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                fontFamily="monospace"
              >
                P({mathX}, {mathY})
              </text>
            </g>
          )}

          {/* Texto izquierda */}
          <g style={{ animation: 'fadeIn 1s ease-out forwards', opacity: 0 }}>
            <text x="20" y="35" fill="white" fontSize="14" fontWeight="bold" fontFamily="sans-serif">
              Posición del cohete
            </text>
            <text x="20" y="52" fill="rgba(255,255,255,0.45)" fontSize="10" fontFamily="sans-serif">
              Curva B(t):
            </text>
            <text x="20" y="68" fill="#60A5FA" fontSize="11" fontWeight="600" fontFamily="monospace">
              {isNear ? `B(${t.toFixed(2)}) = (${mathX}, ${mathY})` : 'Esperando...'}
            </text>
          </g>

          {/* Texto derecha */}
          <g style={{ textAnchor: 'end' }}>
            <text x="480" y="35" fill={isNear ? slopeColor : 'rgba(255,255,255,0.3)'} fontSize="14" fontWeight="bold" fontFamily="sans-serif">
              {isNear ? slopeText : '---'}
            </text>
            <text x="480" y="52" fill="rgba(255,255,255,0.45)" fontSize="10" fontFamily="sans-serif">
              Pendiente:
            </text>
            <text x="480" y="68" fill={isNear ? slopeColor : 'rgba(255,255,255,0.3)'} fontSize="11" fontWeight="bold" fontFamily="monospace">
              {isNear ? `m = ${slope.toFixed(3)}` : 'm = ---'}
            </text>
          </g>

          {/* Guías */}
          <text x="440" y="270" textAnchor="end" fill="rgba(255,255,255,0.15)" fontSize="10" fontFamily="sans-serif">
            Eje X
          </text>
          <text x="250" y="165" textAnchor="middle" fill="rgba(255,255,255,0.15)" fontSize="10" fontFamily="sans-serif">
            Vértice
          </text>
        </svg>
      </div>
    </div>
  );
}

const styles = {
  containerMaster: { display: 'contents' },
  expandedBackdrop: {
    display: 'flex', position: 'fixed', inset: 0,
    backgroundColor: 'rgba(11, 16, 32, 0.9)', backdropFilter: 'blur(16px)',
    justifyContent: 'center', alignItems: 'center', zIndex: 9998,
    animation: 'fadeIn 0.2s ease-out', padding: '12px',
  },
  wrap: {
    width: '100%', height: '320px', borderRadius: '18px', overflow: 'hidden',
    position: 'relative', background: 'linear-gradient(135deg, #0b1020, #0f1a35)',
    boxShadow: '0 15px 35px rgba(0,0,0,0.35)',
    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px',
  },
  expandedCard: {
    width: '96vw', height: '92vh', maxWidth: '1400px', maxHeight: '900px',
    borderRadius: '24px', boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
    animation: 'fadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    padding: '50px 24px 24px 24px',
  },
  svg: { width: '100%', height: '100%', maxHeight: '100%', display: 'block', userSelect: 'none' },
  svgExpanded: { width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' },
  expandBtn: {
    position: 'absolute', top: '18px', right: '18px', width: '40px', height: '40px',
    border: 'none', borderRadius: '12px', background: 'rgba(255,255,255,0.1)',
    color: 'white', cursor: 'pointer', fontSize: '20px', zIndex: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  instruction: {
    position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)',
    background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.7)',
    padding: '6px 16px', borderRadius: '20px', fontSize: '11px',
    fontFamily: 'sans-serif', pointerEvents: 'none',
  },
};
