import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-toastify';

interface Warehouse {
  code: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export const WarehouseManagementPage = () => {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.get('/warehouses');
      setWarehouses(response.data.data);
    } catch (error) {
      toast.error('Error al cargar las bodegas');
    }
  };

  const handleUpdateWarehouse = async () => {
    if (!editingWarehouse) return;

    setIsLoading(true);
    try {
      await apiClient.put(`/warehouses/${editingWarehouse.code}`, {
        status: editingWarehouse.status,
        description: editingWarehouse.description,
      });

      toast.success('Bodega actualizada exitosamente');
      setEditingWarehouse(null);
      fetchWarehouses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al actualizar la bodega');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = (warehouse: Warehouse) => {
    setEditingWarehouse({ ...warehouse });
  };

  const cancelEditing = () => {
    setEditingWarehouse(null);
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">No tienes permisos para acceder a esta página.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestión de Bodegas</h1>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Lista de Bodegas
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Administra los estados y configuraciones de las bodegas del sistema.
          </p>
        </div>

        <ul className="divide-y divide-gray-200">
          {warehouses.map((warehouse) => (
            <li key={warehouse.code} className="px-4 py-4">
              {editingWarehouse?.code === warehouse.code ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Código"
                      value={editingWarehouse.code}
                      disabled
                      className="bg-gray-50"
                    />
                    <Input
                      label="Descripción"
                      value={editingWarehouse.description}
                      onChange={(e) => setEditingWarehouse({
                        ...editingWarehouse,
                        description: e.target.value
                      })}
                    />
                  </div>

                  <div className="md:w-1/2">
                    <Select
                      label="Estado"
                      value={editingWarehouse.status}
                      onChange={(e) => setEditingWarehouse({
                        ...editingWarehouse,
                        status: e.target.value as 'ACTIVE' | 'INACTIVE'
                      })}
                      options={[
                        { value: 'ACTIVE', label: 'Activa' },
                        { value: 'INACTIVE', label: 'Inactiva' },
                      ]}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateWarehouse}
                      isLoading={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Guardar
                    </Button>
                    <Button
                      onClick={cancelEditing}
                      variant="secondary"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {warehouse.code} - {warehouse.description}
                    </h4>
                    <p className={`text-sm ${
                      warehouse.status === 'ACTIVE'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {warehouse.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}
                    </p>
                  </div>
                  <Button
                    onClick={() => startEditing(warehouse)}
                    variant="secondary"
                    size="sm"
                  >
                    Editar
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
