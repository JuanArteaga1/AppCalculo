import { createPortal } from 'react-dom';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sileo';
import 'sileo/styles.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SaberesPrevios from './pages/SaberesPrevios';
import Calculo1 from './pages/Calculo1';
import TemaPage from './pages/TemaPage';
import BibliotecaMultimedia from './pages/BibliotecaMultimedia';
import Laboratorio from './pages/Laboratorio';
import Acceso from './pages/Acceso';
import SeguirAprendiendo from './pages/SeguirAprendiendo';
import Espacio from './pages/Espacio';
import Admin from './pages/Admin';
import NoEncontrado from './pages/NoEncontrado';
import RutaProtegida, { RutaEspacio } from './components/RutaProtegida';
import SesionProvider from './context/SesionProvider';
import './styles/panel.css';
import QuizCompartido from './pages/QuizCompartido';
import Registro from './pages/Registro';
import Confirmar from './pages/Confirmar';

/**
 * Rutas que ocupan toda la pantalla, sin barra de navegación ni pie de página:
 * el laboratorio y el panel de administrador traen su propio marco.
 */
const RUTAS_SIN_MARCO = ['/laboratorio'];
const PREFIJOS_SIN_MARCO = ['/admin'];
/** El acceso conserva la barra, pero el pie estorba en una pantalla de formulario. */
const RUTAS_SIN_PIE = ['/acceso'];

const ZonaAdmin = () => <RutaProtegida roles={['administrador']}><Admin /></RutaProtegida>;

function Contenido() {
  const { pathname } = useLocation();
  const conMarco = !RUTAS_SIN_MARCO.includes(pathname)
    && !PREFIJOS_SIN_MARCO.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const conPie = conMarco && !RUTAS_SIN_PIE.includes(pathname);

  return (
    <>
      {conMarco && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/conceptos-previos" element={<SaberesPrevios />} />
          <Route path="/calculo1" element={<Calculo1 />} />
          <Route path="/calculo1/:unidadId" element={<Calculo1 />} />
          <Route path="/calculo1/:unidadId/:temaId" element={<TemaPage />} />
          <Route path="/videoteca" element={<BibliotecaMultimedia />} />
          <Route path="/laboratorio" element={<Laboratorio />} />
          <Route path="/acceso" element={<Acceso />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/confirmar" element={<Confirmar />} />
          <Route path="/evaluate" element={<SeguirAprendiendo />} />
          <Route path="/espacio" element={<Navigate to="/espacio/estudiante/progreso" replace />} />
          <Route path="/espacio/:rol" element={<RutaEspacio><Espacio /></RutaEspacio>} />
          <Route path="/espacio/:rol/:seccion" element={<RutaEspacio><Espacio /></RutaEspacio>} />
          <Route path="/admin" element={<Navigate to="/admin/panel" replace />} />
          <Route path="/admin/:seccion" element={<ZonaAdmin />} />
          <Route path="/admin/:seccion/:detalle" element={<ZonaAdmin />} />
          <Route path="/admin/:seccion/:detalle/:tema" element={<ZonaAdmin />} />
          <Route
            path="/quiz/:id"
            element={
              <RutaProtegida roles={['estudiante']}>
                <QuizCompartido />
              </RutaProtegida>
            }
          />
          {/* Dentro de la zona protegida, para no mostrar nada del panel sin sesión. */}
          <Route path="/admin/*" element={<ZonaAdmin />} />

          {/* Nombres anteriores: se redirigen para no romper enlaces ya compartidos. */}
          <Route path="/saberes-previos" element={<Navigate to="/conceptos-previos" replace />} />
          <Route path="/seguir-aprendiendo" element={<Navigate to="/evaluate" replace />} />
          <Route path="/biblioteca" element={<Navigate to="/videoteca" replace />} />

          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>
      {conPie && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <SesionProvider>
        <Contenido />
      </SesionProvider>
      {/* Por portal: así ningún contenedor de la página le recorta las alertas. */}
      {createPortal(
        <Toaster position="top-center" theme="light" options={{ fill: '#312E81' }} />,
        document.body,
      )}
    </BrowserRouter>
  );
}

export default App
