import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';

// Función para calcular el último día del mes anterior
const getLastDayOfPreviousMonth = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Si estamos en enero, el mes anterior es diciembre del año anterior
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Crear fecha del último día del mes anterior
  const lastDay = new Date(previousYear, previousMonth + 1, 0);

  // Formatear como YYYY-MM-DD
  return lastDay.toISOString().split('T')[0];
};

interface InventoryCount {
  id: string;
  countNumber: number;
  cutoffDate: string;
  packageQuantity: number;
  unitQuantity: number;
  status: 'PENDING' | 'APPROVED' | 'RECOUNT_REQUESTED' | 'REJECTED';
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
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
  const { user } = useAuth();
  const [inventoryCounts, setInventoryCounts] = useState<InventoryCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    countNumber: '',
    cutoffDate: getLastDayOfPreviousMonth(),
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
    setFilters({ countNumber: '', cutoffDate: getLastDayOfPreviousMonth(), warehouseId: '' });
    setTimeout(() => fetchInventoryCounts(), 100);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      RECOUNT_REQUESTED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    const labels = {
      PENDING: 'Pendiente',
      APPROVED: 'Aprobado',
      RECOUNT_REQUESTED: 'Recontar Solicitado',
      REJECTED: 'Rechazado',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-semibold ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('¿Está seguro de aprobar este conteo?')) return;
    
    setActionLoading(id);
    try {
      await apiClient.post(`/inventory-counts/${id}/approve`, {
        notes: 'Conteo aprobado por el administrador',
      });
      toast.success('Conteo aprobado exitosamente');
      fetchInventoryCounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al aprobar conteo');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestRecount = async (id: string) => {
    const notes = window.prompt('Indique el motivo para solicitar recontar (opcional):');
    if (notes === null) return; // User cancelled
    
    setActionLoading(id);
    try {
      const response = await apiClient.post(`/inventory-counts/${id}/request-recount`, { notes });
      toast.success(response.data.message);
      fetchInventoryCounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al solicitar recontar');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    const notes = window.prompt('Indique el motivo del rechazo (obligatorio):');
    if (!notes || notes.trim() === '') {
      toast.error('Debe proporcionar un motivo para rechazar');
      return;
    }
    
    setActionLoading(id);
    try {
      await apiClient.post(`/inventory-counts/${id}/reject`, { notes });
      toast.success('Conteo rechazado');
      fetchInventoryCounts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al rechazar conteo');
    } finally {
      setActionLoading(null);
    }
  };

  const isAdmin = user?.role === 'ADMIN';

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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Corte</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bodega</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empaques</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidades</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registrado Por</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Registro</th>
                  {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventoryCounts.map((count) => (
                  <tr key={count.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {count.countNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(count.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {count.cutoffDate.split('T')[0].split('-').reverse().join('/')}
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
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {count.status === 'PENDING' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleApprove(count.id)}
                              disabled={actionLoading === count.id}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                            >
                              ✓ Aprobar
                            </button>
                            {count.countNumber < 3 && (
                              <button
                                onClick={() => handleRequestRecount(count.id)}
                                disabled={actionLoading === count.id}
                                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                              >
                                🔄 Recontar
                              </button>
                            )}
                            <button
                              onClick={() => handleReject(count.id)}
                              disabled={actionLoading === count.id}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                              ✗ Rechazar
                            </button>
                          </div>
                        )}
                        {count.status === 'APPROVED' && (
                          <span className="text-green-600 text-xs">✓ Aprobado</span>
                        )}
                        {count.status === 'RECOUNT_REQUESTED' && (
                          <span className="text-blue-600 text-xs">Esperando conteo {count.countNumber + 1}</span>
                        )}
                        {count.status === 'REJECTED' && (
                          <span className="text-red-600 text-xs">✗ Rechazado</span>
                        )}
                        {count.reviewNotes && (
                          <div className="text-xs text-gray-500 mt-1" title={count.reviewNotes}>
                            💬 {count.reviewNotes.substring(0, 30)}...
                          </div>
                        )}
                      </td>
                    )}
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