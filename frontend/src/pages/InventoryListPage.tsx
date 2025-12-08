import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

interface InventoryCount {
  id: string;
  countNumber: number;
  cutoffDate: string;
  packageQuantity: number;
  unitQuantity: number;
  createdAt: string;
  warehouse: {
    code: string;
    description: string;
  };
  product: {
    code: string;
    description: string;
    packagingUnit: string;
  };
  user: {
    name: string;
  };
}

export const InventoryListPage = () => {
  const [inventoryCounts, setInventoryCounts] = useState<InventoryCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    countNumber: '',
    cutoffDate: '',
    warehouseId: '',
  });

  useEffect(() => {
    fetchInventoryCounts();
  }, []);

  const fetchInventoryCounts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.countNumber) params.append('countNumber', filters.countNumber);
      if (filters.cutoffDate) params.append('cutoffDate', filters.cutoffDate);
      if (filters.warehouseId) params.append('warehouseId', filters.warehouseId);

      const response = await apiClient.get(`/inventory-counts?${params.toString()}`);
      setInventoryCounts(response.data.data);
    } catch (error) {
      toast.error('Error al cargar conteos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchInventoryCounts();
  };

  const clearFilters = () => {
    setFilters({ countNumber: '', cutoffDate: '', warehouseId: '' });
    setTimeout(() => fetchInventoryCounts(), 100);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Consulta de Conteos de Inventario</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros de Búsqueda</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Número de Conteo"
            value={filters.countNumber}
            onChange={(e) => setFilters({ ...filters, countNumber: e.target.value })}
            options={[
              { value: '1', label: 'Conteo 1' },
              { value: '2', label: 'Conteo 2' },
              { value: '3', label: 'Conteo 3' },
            ]}
          />
          <Input
            label="Fecha de Corte"
            type="date"
            value={filters.cutoffDate}
            onChange={(e) => setFilters({ ...filters, cutoffDate: e.target.value })}
          />
          <Input
            label="Código de Bodega"
            type="text"
            value={filters.warehouseId}
            onChange={(e) => setFilters({ ...filters, warehouseId: e.target.value })}
            placeholder="ej: 00009"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={handleSearch}>Buscar</Button>
          <Button variant="secondary" onClick={clearFilters}>Limpiar Filtros</Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Cargando...</div>
        ) : inventoryCounts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No se encontraron registros de conteo
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Conteo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Corte</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bodega</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empaques</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidades</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrado Por</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Registro</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryCounts.map((count) => (
                  <tr key={count.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {count.countNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(count.cutoffDate), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {count.warehouse.code} - {count.warehouse.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {count.product.code} - {count.product.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {count.packageQuantity} {count.product.packagingUnit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      {count.unitQuantity} UND
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {count.user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(count.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};