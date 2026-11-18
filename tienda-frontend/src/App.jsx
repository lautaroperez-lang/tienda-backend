import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CarritoProvider } from './context/CarritoContext';
import Navbar from './components/Navbar';
import RutaProtegida from './components/RutaProtegida';
import Home from './pages/Home';
import Login from './pages/Login';
import Registro from './pages/Registro';
import MiCuenta from './pages/MiCuenta';
import PanelAdmin from './pages/PanelAdmin';
import Carrito from './pages/Carrito';
import MisPedidos from './pages/MisPedidos';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CarritoProvider>
          <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />

                {/* Rutas protegidas por sesión */}
                <Route element={<RutaProtegida />}>
                  <Route path="/mi-cuenta" element={<MiCuenta />} />
                  <Route path="/carrito" element={<Carrito />} />
                  <Route path="/mis-pedidos" element={<MisPedidos />} />
                </Route>

                {/* Ruta protegida por rol admin */}
                <Route element={<RutaProtegida rol="admin" />}>
                  <Route path="/admin" element={<PanelAdmin />} />
                </Route>

                {/* Ruta fallback */}
                <Route path="*" element={<Home />} />
              </Routes>
            </main>
          </div>
        </CarritoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
