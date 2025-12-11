import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';

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

interface Product {
  code: string;
  description: string;
  conversionFactor: number;
  packagingUnit: string;
}

interface Warehouse {
  code: string;
  description: string;
  status: string;
}

export const InventoryFormPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [countNumber, setCountNumber] = useState(1);
  const [cutoffDate, setCutoffDate] = useState(getLastDayOfPreviousMonth());
  const [packageQuantity, setPackageQuantity] = useState(0);
  const [unitQuantity, setUnitQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [countInfo, setCountInfo] = useState<{canRegister: boolean, message: string} | null>(null);
  const [warehouseWarning, setWarehouseWarning] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchWarehouses();
  }, []);

  useEffect(() => {
    const product = products.find(p => p.code === selectedProduct);
    if (product) {
      setUnitQuantity(packageQuantity * product.conversionFactor);
    }
  }, [packageQuantity, selectedProduct, products]);

  useEffect(() => {
    if (countNumber > 1 && selectedProduct && selectedWarehouse && cutoffDate) {
      checkPreviousCount();
    } else {
      setCountInfo(null);
    }
  }, [countNumber, selectedProduct, selectedWarehouse, cutoffDate]);

  useEffect(() => {
    if (selectedWarehouse) {
      const warehouse = availableWarehouses.find(w => w.code === selectedWarehouse);
      if (warehouse?.status === 'INACTIVE') {
        setWarehouseWarning(`La bodega ${warehouse.description} está inactiva. No se pueden registrar nuevos conteos.`);
      } else {
        setWarehouseWarning(null);
      }
    } else {
      setWarehouseWarning(null);
    }
  }, [selectedWarehouse]);

  const checkPreviousCount = async () => {
    try {
      const response = await apiClient.get('/inventory-counts', {
        params: {
          productId: selectedProduct,
          warehouseId: selectedWarehouse,
          cutoffDate: cutoffDate,
          countNumber: countNumber - 1,
        },
      });

      const previousCount = response.data.data[0];

      if (!previousCount) {
        setCountInfo({
          canRegister: false,
          message: `⚠️ No existe el conteo ${countNumber - 1}. Debe registrarlo primero.`,
        });
      } else if (previousCount.status !== 'RECOUNT_REQUESTED') {
        setCountInfo({
          canRegister: false,
          message: `⚠️ El conteo ${countNumber - 1} está en estado "${previousCount.status}".
                   Un administrador debe solicitar recontar antes de que pueda registrar el conteo ${countNumber}.`,
        });
      } else {
        setCountInfo({
          canRegister: true,
          message: `✓ El administrador solicitó recontar. Puede registrar el conteo ${countNumber}.`,
        });
      }
    } catch (error) {
      console.error('Error checking previous count:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data.data);
    } catch (error) {
      toast.error('Error al cargar productos');
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await apiClient.get('/warehouses');
      setWarehouses(response.data.data);
    } catch (error) {
      toast.error('Error al cargar las bodegas');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (warehouseWarning) {
      toast.error('No se puede registrar conteo en bodega inactiva');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/inventory-counts', {
        countNumber,
        cutoffDate,
        warehouseId: selectedWarehouse,
        productId: selectedProduct,
        packageQuantity,
      });

      toast.success('Conteo registrado exitosamente');

      // Limpiar formulario
      setSelectedWarehouse('');
      setSelectedProduct('');
      setPackageQuantity(0);
      setUnitQuantity(0);
      setCountNumber(1);
      setCountInfo(null);
      setWarehouseWarning(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar conteo');
    } finally {
      setIsLoading(false);
    }
  };

  // Los administradores pueden ver todas las bodegas activas,
  // los usuarios normales ven todas las bodegas asignadas (activas e inactivas)
  const availableWarehouses = user?.role === 'ADMIN'
    ? warehouses.filter(w => w.status === 'ACTIVE')
    : (user?.warehouses || []);
  const selectedProductData = products.find(p => p.code === selectedProduct);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Registro de Conteo de Inventario</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <Select
          label="Número de Conteo"
          value={countNumber.toString()}
          onChange={(e) => setCountNumber(Number(e.target.value))}
          options={[
            { value: '1', label: 'Conteo 1' },
            { value: '2', label: 'Conteo 2' },
            { value: '3', label: 'Conteo 3' },
          ]}
          required
        />

        {warehouseWarning && (
          <div className="mb-4 p-4 rounded bg-yellow-50 text-yellow-800 border border-yellow-200">
            <p className="text-sm">⚠️ {warehouseWarning}</p>
          </div>
        )}

        {countInfo && (
          <div className={`mb-4 p-4 rounded ${
            countInfo.canRegister
              ? 'bg-green-50 border border-green-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`text-sm ${
              countInfo.canRegister ? 'text-green-800' : 'text-yellow-800'
            }`}>
              {countInfo.message}
            </p>
          </div>
        )}

        <div className="mb-4">
          <Input
            label="Fecha de Corte (último día del mes anterior)"
            type="date"
            value={cutoffDate}
            readOnly
            className="bg-gray-50 cursor-not-allowed"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            La fecha de corte se calcula automáticamente como el último día del mes anterior
          </p>
        </div>

        <Select
          label="Bodega"
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          options={availableWarehouses.map(w => ({
            value: w.code,
            label: `${w.code} - ${w.description}${w.status === 'INACTIVE' ? ' (INACTIVA)' : ''}`,
          }))}
          required
        />

        <Select
          label="Producto"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          options={products.map(p => ({
            value: p.code,
            label: `${p.code} - ${p.description}`,
          }))}
          required
        />

        {selectedProductData && (
          <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
            <p><strong>Unidad de empaque:</strong> {selectedProductData.packagingUnit}</p>
            <p><strong>Factor de conversión:</strong> {selectedProductData.conversionFactor}</p>
          </div>
        )}

        <Input
          label={`Cantidad (${selectedProductData?.packagingUnit || 'empaques'})`}
          type="number"
          min="0"
          value={packageQuantity}
          onChange={(e) => setPackageQuantity(Number(e.target.value))}
          required
        />

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium text-gray-700">
            Cantidad en Unidades (calculado): <span className="text-lg font-bold text-blue-600">{unitQuantity}</span>
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={(countInfo && !countInfo.canRegister) || !!warehouseWarning}
        >
          Registrar Conteo
        </Button>

        {countInfo && !countInfo.canRegister && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            El botón está deshabilitado porque no cumple los requisitos.
          </p>
        )}
      </form>
    </div>
  );
};