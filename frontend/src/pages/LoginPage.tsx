import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';

export const LoginPage = () => {
  const [identification, setIdentification] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(identification, password);
      toast.success('Inicio de sesión exitoso');
      // Pequeño delay para permitir que el estado se actualice
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sistema de Inventarios
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Soberana SAS
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow" onSubmit={handleSubmit}>
          <Input
            label="Identificación"
            type="text"
            value={identification}
            onChange={(e) => setIdentification(e.target.value)}
            required
            placeholder="Ingrese su identificación"
          />
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Ingrese su contraseña"
          />
          <Button type="submit" className="w-full" isLoading={isLoading}>
            Iniciar Sesión
          </Button>
          <div className="text-xs text-gray-500 mt-4">
            <p>Usuarios de prueba:</p>
            <p>Admin: 12345678 / admin123</p>
            <p>Usuario: 80299534 / user123</p>
          </div>
        </form>
      </div>
    </div>
  );
};