import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SaberesPrevios from './pages/SaberesPrevios';
import Calculo1 from './pages/Calculo1';
import TemaPage from './pages/TemaPage';
import BibliotecaMultimedia from './pages/BibliotecaMultimedia';
import Laboratorio from './pages/Laboratorio';

/** Rutas que ocupan toda la pantalla, sin barra de navegación ni pie de página. */
const RUTAS_SIN_MARCO = ['/laboratorio'];

function Contenido() {
  const { pathname } = useLocation();
  const conMarco = !RUTAS_SIN_MARCO.includes(pathname);

  return (
    <>
      {conMarco && <Navbar />}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/saberes-previos" element={<SaberesPrevios />} />
          <Route path="/calculo1" element={<Calculo1 />} />
          <Route path="/calculo1/:unidadId" element={<Calculo1 />} />
          <Route path="/calculo1/:unidadId/:temaId" element={<TemaPage />} />
          <Route path="/biblioteca" element={<BibliotecaMultimedia />} />
          <Route path="/laboratorio" element={<Laboratorio />} />
        </Routes>
      </main>
      {conMarco && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Contenido />
    </BrowserRouter>
  );
}

export default App
