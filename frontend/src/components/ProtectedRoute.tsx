import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Ajusta la ruta si es necesario

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Asume que tienes un contexto de autenticación

  if (!isAuthenticated) {
    // Redirige al usuario a la página de inicio de sesión si no está autenticado
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export { ProtectedRoute };
