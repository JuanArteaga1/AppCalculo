import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { MdMenu, MdClose } from 'react-icons/md';

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Inicio' },
    { path: '/saberes-previos', label: 'Saberes Previos' },
    { path: '/calculo1', label: 'Cálculo I' },
    { path: '/laboratorio', label: 'Laboratorio' },
    { path: '/biblioteca', label: 'Biblioteca' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav style={styles.navbar}>
      <div className="navbar-container" style={styles.container}>
        <Link to="/" style={styles.logo}>
          <img
            className="navbar-logo-img"
            src="/LogoUniversidad.png"
            alt="Logo Universidad"
          />
          <div style={styles.brand}>
            <span className="navbar-brand-title">LimitsHub</span>
            <span className="navbar-brand-subtitle">Plataforma Educativa</span>
          </div>
        </Link>

        <button
          className="navbar-menu-btn"
          style={styles.menuBtn}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menú"
        >
          {mobileOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
        </button>

        <ul className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.path} className="navbar-item">
              <Link
                className="navbar-link"
                to={link.path}
                style={{
                  ...styles.link,
                  ...(isActive(link.path) ? styles.linkActive : {}),
                }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="navbar-item">
            <Link className="navbar-cta" to="/calculo1" style={styles.ctaBtn} onClick={() => setMobileOpen(false)}>
              Comenzar
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

const styles = {
  navbar: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    background: 'rgba(11,16,32,0.92)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
  },
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1200px',
    margin: '0 auto',
    gap: '12px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    textDecoration: 'none',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    padding: '8px',
    margin: '-8px',
  },
  link: {
    display: 'block',
    borderRadius: '8px',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.75)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  linkActive: {
    background: 'rgba(244,180,0,0.12)',
    color: '#F4B400',
  },
  ctaBtn: {
    alignItems: 'center',
    background: '#F4B400',
    color: '#1a1a1a',
    fontWeight: 700,
    borderRadius: '10px',
    textDecoration: 'none',
    boxShadow: '0 4px 12px rgba(244,180,0,0.35)',
    transition: 'all 0.2s ease',
  },
};

// Se añade el CSS de media queries por script para no depender de archivos externos
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    /* --- Base: mobile first --- */
    .navbar-container { padding: 10px 16px; }
    .navbar-logo-img { height: 36px; width: auto; object-fit: contain; flex-shrink: 0; }
    .navbar-brand-title { font-family: 'Poppins', sans-serif; font-size: 16px; font-weight: 700; color: #F4B400; line-height: 1.2; }
    .navbar-brand-subtitle { font-size: 10px; color: rgba(255,255,255,0.5); font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; }
    .navbar-menu-btn { display: inline-flex; align-items: center; justify-content: center; }

    /* Menú desplegable en móvil */
    .navbar-links {
      display: none;
      list-style: none;
      margin: 0;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
      background: rgba(11,16,32,0.98);
      backdrop-filter: blur(12px);
      padding: 12px 16px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 10px 15px rgba(0,0,0,0.3);
      max-height: calc(100vh - 100%);
      overflow-y: auto;
    }
    .navbar-links.open { display: flex; }
    .navbar-links .navbar-link { padding: 14px 16px; font-size: 16px; }
    .navbar-links .navbar-cta { display: flex; justify-content: center; width: 100%; margin-top: 8px; padding: 14px 20px; font-size: 15px; }

    /* --- Escritorio: con 5 enlaces la barra horizontal necesita ~1080px --- */
    @media (min-width: 1080px) {
      .navbar-container { padding: 12px 24px; }
      .navbar-logo-img { height: 44px; }
      .navbar-brand-title { font-size: 18px; }
      .navbar-brand-subtitle { font-size: 11px; }
      .navbar-menu-btn { display: none; }
      .navbar-links {
        display: flex;
        position: static;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        background: none;
        backdrop-filter: none;
        padding: 0;
        border: none;
        box-shadow: none;
        max-height: none;
        overflow: visible;
      }
      .navbar-links .navbar-link { padding: 10px 16px; font-size: 15px; }
      .navbar-links .navbar-cta { display: inline-flex; width: auto; margin-top: 0; padding: 10px 20px; font-size: 14px; }
    }
  `;
  document.head.appendChild(style);
}
