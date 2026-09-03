import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PARTICLES = Array.from({ length: 20 }, () => ({
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 5,
  duration: 3 + Math.random() * 4,
  size: 4 + Math.random() * 6,
}));

const CAROUSEL_ITEMS = [
  { src: '/gift2.gif', alt: 'Gráfica animada de derivada' },
  { src: '/Quimerito.png', alt: 'Quimerito - Mascota universitaria' },
];

const SWIPE_THRESHOLD = 50;

export default function Home() {
  const particles = useMemo(() => PARTICLES, []);
  const [currentSlide, setCurrentSlide] = useState(0);
  const touchStartX = useRef(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_ITEMS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_ITEMS.length) % CAROUSEL_ITEMS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (delta <= -SWIPE_THRESHOLD) nextSlide();
    else if (delta >= SWIPE_THRESHOLD) prevSlide();
    touchStartX.current = null;
  };

  return (
    <div style={styles.page}>
      {/* HERO SECTION */}
      <section className="hero" style={styles.hero}>
        <div style={styles.heroParticles}>
          {particles.map((p, i) => (
            <div key={i} style={{
              ...styles.particle,
              left: `${p.left}%`,
              top: `${p.top}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }} />
          ))}
        </div>
        <div className="container hero-container">
          <div className="hero-left">
            <div className="hero-badge">
              <span style={styles.heroBadgeDot} />
              Plataforma Educativa Universitaria
            </div>
            <h1 className="hero-title">
              Cálculo Diferencial de forma{' '}
              <span style={styles.heroAccent}>visual e interactiva</span>
            </h1>
            <p className="hero-desc">
              Reduce la ansiedad matemática y domina los conceptos de Cálculo con visualizaciones dinámicas,
              retroalimentación inmediata y un asistente IA disponible 24/7.
            </p>
            <div className="hero-actions">
              <Link to="/calculo1" className="hero-btn hero-btn-primary">
                Explorar cursos
                <FiArrowRight />
              </Link>
              <Link to="/saberes-previos" className="hero-btn hero-btn-ghost">
                Saberes previos
              </Link>
            </div>
          </div>
          <div
            className="carousel-wrap"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div style={styles.carouselInner}>
              {CAROUSEL_ITEMS.map((item, i) => (
                <div key={i} style={{
                  ...styles.carouselSlide,
                  opacity: i === currentSlide ? 1 : 0,
                  transform: i === currentSlide ? 'scale(1)' : 'scale(0.95)',
                }}>
                  <img
                    className="carousel-image"
                    src={item.src}
                    alt={item.alt}
                  />
                </div>
              ))}
            </div>
            <button onClick={prevSlide} className="carousel-btn carousel-btn-prev" aria-label="Anterior">
              <FiChevronLeft />
            </button>
            <button onClick={nextSlide} className="carousel-btn carousel-btn-next" aria-label="Siguiente">
              <FiChevronRight />
            </button>
            <div style={styles.carouselDots}>
              {CAROUSEL_ITEMS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className="carousel-dot"
                  style={{
                    background: i === currentSlide ? '#F4B400' : 'rgba(255,255,255,0.3)',
                    transform: i === currentSlide ? 'scale(1.3)' : 'scale(1)',
                  }}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ICONOS ANIMADOS DE CÁLCULO VINCULADOS A SUS RUTAS */}
      <section className="calculus-section">
        <div className="container">
          <div className="calculus-grid">
            <CalculusIcon
              title="Límites"
              animation="limit"
              to="/calculo1/limites"
            />
            <CalculusIcon
              title="Derivadas"
              animation="derivative"
              to="/calculo1/derivadas"
            />
            <CalculusIcon
              title="Aplicación de la Derivada"
              animation="application"
              to="/calculo1/aplicaciones"
            />
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.6; }
          50% { transform: translateY(-20px); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        @keyframes drawLine {
          0% { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes tangentMove {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        @keyframes pointGlow {
          0%, 100% { r: 4; opacity: 1; }
          50% { r: 6; opacity: 0.7; }
        }
        @keyframes slideIn {
          0% { transform: translateX(-10px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes scaleIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fillUp {
          0% { transform: scaleY(0); }
          100% { transform: scaleY(1); }
        }

        /* ---------- HERO (mobile first) ---------- */
        .hero {
          padding: 40px 0 32px;
        }
        .hero-container {
          display: grid;
          grid-template-columns: 1fr;
          align-items: center;
          gap: 32px;
          position: relative;
          z-index: 1;
        }
        .hero-left {
          display: flex;
          flex-direction: column;
          gap: 16px;
          min-width: 0;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.9);
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          width: fit-content;
          max-width: 100%;
          backdrop-filter: blur(4px);
          border: 1px solid rgba(255,255,255,0.1);
          animation: slideIn 0.6s ease forwards;
        }
        .hero-title {
          font-size: clamp(28px, 7.5vw, 52px);
          font-weight: 800;
          line-height: 1.15;
          color: #fff;
          margin: 0;
          font-family: 'Poppins', sans-serif;
          overflow-wrap: break-word;
          animation: slideIn 0.8s ease forwards;
        }
        .hero-desc {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255,255,255,0.7);
          max-width: 480px;
          margin: 0;
          animation: slideIn 1s ease forwards;
        }
        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 8px;
          animation: slideIn 1.2s ease forwards;
        }
        .hero-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          flex: 1 1 160px;
          padding: 14px 20px;
          font-size: 15px;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .hero-btn-primary {
          background: #F4B400;
          color: #0b1020;
          font-weight: 700;
          box-shadow: 0 8px 24px rgba(244,180,0,0.3);
        }
        .hero-btn-ghost {
          background: rgba(255,255,255,0.06);
          color: #fff;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(4px);
        }

        /* ---------- CARRUSEL ---------- */
        .carousel-wrap {
          position: relative;
          width: 100%;
          height: clamp(220px, 60vw, 400px);
          overflow: hidden;
          border-radius: 16px;
          background: rgba(255,255,255,0.03);
          touch-action: pan-y;
        }
        .carousel-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
          display: block;
        }
        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(11,16,32,0.7);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          backdrop-filter: blur(4px);
          transition: background 0.2s ease;
        }
        .carousel-btn-prev { left: 8px; }
        .carousel-btn-next { right: 8px; }
        .carousel-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }

        /* ---------- SECCIÓN DE ICONOS ---------- */
        .calculus-section {
          background: #0b1020;
          padding: 32px 0 48px;
        }
        .calculus-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          max-width: 780px;
          margin: 0 auto;
        }
        .calculus-icon-card:hover .icon-svg {
          transform: scale(1.1);
        }
        .calculus-icon-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(244, 180, 0, 0.15);
        }

        /* ---------- TABLET ---------- */
        @media (min-width: 600px) {
          .hero-desc { font-size: 17px; }
          .carousel-btn { width: 40px; height: 40px; }
          .carousel-btn-prev { left: 12px; }
          .carousel-btn-next { right: 12px; }
          .calculus-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
        }

        /* ---------- DESKTOP ---------- */
        @media (min-width: 1025px) {
          .hero { padding: 80px 0 48px; }
          .hero-container { grid-template-columns: 1fr 1fr; gap: 48px; }
          .hero-left { gap: 20px; }
          .hero-badge { font-size: 13px; }
          .hero-desc { font-size: 18px; }
          .hero-btn { flex: 0 0 auto; padding: 14px 28px; font-size: 16px; }
          .carousel-image { object-fit: cover; object-position: center top; }
          .calculus-section { padding: 48px 0 64px; }
          .calculus-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* Pantallas muy pequeñas: los botones ocupan todo el ancho */
        @media (max-width: 380px) {
          .hero-btn { flex: 1 1 100%; }
        }
      `}</style>
    </div>
  );
}

function CalculusIcon({ title, animation, to }) {
  const renderAnimation = () => {
    switch (animation) {
      case 'limit':
        return (
          <svg className="icon-svg" width="80" height="80" viewBox="0 0 50 50">
            <line x1="5" y1="40" x2="45" y2="40" stroke="#F4B400" strokeWidth="2" opacity="0.3" />
            <line x1="5" y1="5" x2="5" y2="45" stroke="#F4B400" strokeWidth="2" opacity="0.3" />
            <path d="M 5 35 Q 15 10 25 20 Q 35 30 45 15" fill="none" stroke="#F4B400" strokeWidth="2.5"
              strokeDasharray="100" strokeDashoffset="100" style={{ animation: 'drawLine 2s ease forwards' }} />
            <circle cx="30" cy="22" r="4" fill="#fff"
              style={{ animation: 'pointGlow 1.5s ease-in-out infinite' }} />
            <circle cx="30" cy="22" r="8" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.4"
              style={{ animation: 'pulse 2s ease-in-out infinite' }} />
            <text x="33" y="18" fontSize="8" fill="#F4B400" fontWeight="700" fontFamily="Poppins">x→a</text>
          </svg>
        );
      case 'derivative':
        return (
          <svg className="icon-svg" width="80" height="80" viewBox="0 0 50 50">
            <path d="M 5 40 Q 15 35 25 25 Q 35 15 45 10" fill="none" stroke="#F4B400" strokeWidth="2.5"
              strokeDasharray="80" strokeDashoffset="80" style={{ animation: 'drawLine 1.8s ease forwards' }} />
            <line x1="15" y1="32" x2="40" y2="12" stroke="#fff" strokeWidth="2" strokeDasharray="4 3"
              style={{ animation: 'tangentMove 3s ease-in-out infinite', transformOrigin: '25px 25px' }} />
            <circle cx="25" cy="25" r="4" fill="#fff"
              style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
            <text x="6" y="37" fontSize="7" fill="#10B981" fontWeight="600" fontFamily="Poppins">f'</text>
          </svg>
        );
      case 'application':
        return (
          <svg className="icon-svg" width="80" height="80" viewBox="0 0 50 50">
            <line x1="5" y1="40" x2="45" y2="40" stroke="#F4B400" strokeWidth="1.5" opacity="0.3" />
            <line x1="5" y1="5" x2="5" y2="45" stroke="#F4B400" strokeWidth="1.5" opacity="0.3" />
            <path d="M 8 35 Q 15 8 25 20 Q 35 32 42 10" fill="none" stroke="#F4B400" strokeWidth="2"
              strokeDasharray="80" strokeDashoffset="80" style={{ animation: 'drawLine 2s ease forwards' }} />
            <rect x="20" y="10" width="10" height="28" fill="#10B981" opacity="0"
              style={{ animation: 'fillUp 0.8s ease 1.5s forwards', transformOrigin: 'bottom' }} />
            <circle cx="25" cy="20" r="3" fill="#fff" opacity="0"
              style={{ animation: 'scaleIn 0.4s ease 2s forwards' }} />
            <text x="32" y="16" fontSize="7" fill="#10B981" fontWeight="700" fontFamily="Poppins">max</text>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div className="calculus-icon-card" style={styles.calculusCard}>
        <div style={styles.iconContainer}>
          {renderAnimation()}
        </div>
        <h3 style={styles.iconTitle}>{title}</h3>
      </div>
    </Link>
  );
}

const styles = {
  page: {
    background: '#0b1020',
    minHeight: '100vh',
    overflowX: 'hidden',
  },
  hero: {
    background: 'linear-gradient(135deg, #0f1a35 0%, #0b1020 50%, #0b1020 100%)',
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  heroParticles: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    background: 'rgba(244, 180, 0, 0.3)',
    animation: 'float 4s ease-in-out infinite',
  },
  heroBadgeDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#10B981',
    display: 'inline-block',
    flexShrink: 0,
    animation: 'pulse 2s ease-in-out infinite',
  },
  heroAccent: {
    color: '#F4B400',
    background: 'linear-gradient(90deg, #F4B400, #FFD54F)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  carouselInner: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  carouselSlide: {
    position: 'absolute',
    inset: 0,
    transition: 'opacity 0.6s ease, transform 0.6s ease',
  },
  carouselDots: {
    position: 'absolute',
    bottom: '16px',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    gap: '8px',
    zIndex: 2,
  },

  calculusCard: {
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '20px',
    padding: '32px 20px 28px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.08)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '16px',
    height: '90px',
  },
  iconSvg: {
    transition: 'transform 0.3s ease',
  },
  iconTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
    fontFamily: "'Poppins', sans-serif",
  },
};