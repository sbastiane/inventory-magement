import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';

interface Warehouse {
  code: string;
  description: string;
}

interface User {
  id: string;
  identification: string;
  name: string;
  role: string;
  warehouses: Warehouse[];
}

export const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    identification: '',
    name: '',
    password: '',
    role: 'USER',
    warehouseIds: [] as string[],
  });

  useEffect(() => {
    fetchUsers();
    fetchWarehouses();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.get('/warehouses');
      setWarehouses(response.data.data);
    } catch (error) {
      toast.error('Error al cargar bodegas');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiClient.post('/users', formData);
      toast.success('Usuario creado exitosamente');
      setShowForm(false);
      setFormData({
        identification: '',
        name: '',
        password: '',
        role: 'USER',
        warehouseIds: [],
      });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWarehouseToggle = (warehouseCode: string) => {
    setFormData(prev => ({
      ...prev,
      warehouseIds: prev.warehouseIds.includes(warehouseCode)
        ? prev.warehouseIds.filter(id => id !== warehouseCode)
        : [...prev.warehouseIds, warehouseCode],
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : 'Nuevo Usuario'}
        </Button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-lg font-semibold mb-4">Crear Nuevo Usuario</h2>
          <form onSubmit={handleSubmit}>
            <Input
              label="Identificación"
              type="text"
              value={formData.identification}
              onChange={(e) => setFormData({ ...formData, identification: e.target.value })}
              required
            />
            <Input
              label="Nombre Completo"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Select
              label="Rol"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'USER', label: 'Usuario' },
                { value: 'ADMIN', label: 'Administrador' },
              ]}
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bodegas Asignadas
              </label>
              <div className="space-y-2 border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                {warehouses.map((warehouse) => (
                  <label key={warehouse.code} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.warehouseIds.includes(warehouse.code)}
                      onChange={() => handleWarehouseToggle(warehouse.code)}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      {warehouse.code} - {warehouse.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              Crear Usuario
            </Button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Identificación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bodegas Asignadas</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.identification}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role === 'ADMIN' ? 'Administrador' : 'Usuario'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.warehouses.map(w => w.description).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};