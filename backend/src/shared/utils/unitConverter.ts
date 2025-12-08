export class UnitConverter {
    static convertPackageToUnits(packageQuantity: number, conversionFactor: number): number {
      if (packageQuantity < 0) {
        throw new Error('La cantidad de empaques no puede ser negativa');
      }
      if (conversionFactor <= 0) {
        throw new Error('El factor de conversión debe ser mayor a cero');
      }
      return packageQuantity * conversionFactor;
    }
  
    static convertUnitsToPackage(unitQuantity: number, conversionFactor: number): number {
      if (unitQuantity < 0) {
        throw new Error('La cantidad de unidades no puede ser negativa');
      }
      if (conversionFactor <= 0) {
        throw new Error('El factor de conversión debe ser mayor a cero');
      }
      return Math.floor(unitQuantity / conversionFactor);
    }
  }