import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || null);
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cerrarSesion = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken(null);
    setUsuario(null);
    setCargando(false);
  };

  const iniciarSesion = (tokens) => {
    if (typeof tokens === 'string') {
      localStorage.setItem('access_token', tokens);
      setToken(tokens);
    } else if (tokens && tokens.access_token) {
      localStorage.setItem('access_token', tokens.access_token);
      if (tokens.refresh_token) {
        localStorage.setItem('refresh_token', tokens.refresh_token);
      }
      setToken(tokens.access_token);
    }
  };

  useEffect(() => {
    if (!token) {
      setUsuario(null);
      setCargando(false);
      return;
    }

    let isMounted = true;
    setCargando(true);

    getMe()
      .then((data) => {
        if (isMounted) {
          setUsuario(data);
          setCargando(false);
        }
      })
      .catch((err) => {
        console.error('Error al recuperar perfil del usuario:', err);
        if (isMounted) {
          cerrarSesion();
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        cargando,
        iniciarSesion,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
