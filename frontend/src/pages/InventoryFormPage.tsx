import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';

interface Product {
  code: string;
  description: string;
  conversionFactor: number;
  packagingUnit: string;
}

export const InventoryFormPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [countNumber, setCountNumber] = useState(1);
  const [cutoffDate, setCutoffDate] = useState('');
  const [packageQuantity, setPackageQuantity] = useState(0);
  const [unitQuantity, setUnitQuantity] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const product = products.find(p => p.code === selectedProduct);
    if (product) {
      setUnitQuantity(packageQuantity * product.conversionFactor);
    }
  }, [packageQuantity, selectedProduct, products]);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data.data);
    } catch (error) {
      toast.error('Error al cargar productos');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      
      setSelectedProduct('');
      setPackageQuantity(0);
      setUnitQuantity(0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al registrar conteo');
    } finally {
      setIsLoading(false);
    }
  };

  const activeWarehouses = user?.warehouses.filter(w => w.status === 'ACTIVE') || [];
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

        <Input
          label="Fecha de Corte"
          type="date"
          value={cutoffDate}
          onChange={(e) => setCutoffDate(e.target.value)}
          required
        />

        <Select
          label="Bodega"
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          options={activeWarehouses.map(w => ({
            value: w.code,
            label: `${w.code} - ${w.description}`,
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

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Registrar Conteo
        </Button>
      </form>
    </div>
  );
};