import { describe, it, expect } from 'vitest';
import { UnitConverter } from './unitConverter';

describe('UnitConverter', () => {
  describe('convertPackageToUnits', () => {
    it('debe convertir correctamente cajas a unidades con factor 12', () => {
      const result = UnitConverter.convertPackageToUnits(5, 12);
      expect(result).toBe(60);
    });

    it('debe convertir correctamente arrobas a unidades con factor 24', () => {
      const result = UnitConverter.convertPackageToUnits(10, 24);
      expect(result).toBe(240);
    });

    it('debe retornar 0 cuando la cantidad de empaques es 0', () => {
      const result = UnitConverter.convertPackageToUnits(0, 12);
      expect(result).toBe(0);
    });

    it('debe manejar números decimales correctamente', () => {
      const result = UnitConverter.convertPackageToUnits(2.5, 12);
      expect(result).toBe(30);
    });

    it('debe lanzar error si la cantidad de empaques es negativa', () => {
      expect(() => UnitConverter.convertPackageToUnits(-5, 12)).toThrow(
        'La cantidad de empaques no puede ser negativa'
      );
    });

    it('debe lanzar error si el factor de conversión es 0', () => {
      expect(() => UnitConverter.convertPackageToUnits(5, 0)).toThrow(
        'El factor de conversión debe ser mayor a cero'
      );
    });

    it('debe lanzar error si el factor de conversión es negativo', () => {
      expect(() => UnitConverter.convertPackageToUnits(5, -12)).toThrow(
        'El factor de conversión debe ser mayor a cero'
      );
    });
  });

  describe('convertUnitsToPackage', () => {
    it('debe convertir unidades a cajas correctamente', () => {
      const result = UnitConverter.convertUnitsToPackage(60, 12);
      expect(result).toBe(5);
    });

    it('debe redondear hacia abajo unidades incompletas', () => {
      const result = UnitConverter.convertUnitsToPackage(65, 12);
      expect(result).toBe(5);
    });

    it('debe retornar 0 cuando no alcanza para un empaque completo', () => {
      const result = UnitConverter.convertUnitsToPackage(5, 12);
      expect(result).toBe(0);
    });

    it('debe lanzar error si la cantidad de unidades es negativa', () => {
      expect(() => UnitConverter.convertUnitsToPackage(-60, 12)).toThrow(
        'La cantidad de unidades no puede ser negativa'
      );
    });
  });

  describe('casos de uso reales con productos de Soberana', () => {
    it('ATUN TRIPACK - 3 cajas = 36 unidades', () => {
      const result = UnitConverter.convertPackageToUnits(3, 12);
      expect(result).toBe(36);
    });

    it('HARINA AREPA REPA - 5 arrobas = 120 unidades', () => {
      const result = UnitConverter.convertPackageToUnits(5, 24);
      expect(result).toBe(120);
    });

    it('HARINA LA SOBERANA - 10 arrobas = 240 unidades', () => {
      const result = UnitConverter.convertPackageToUnits(10, 24);
      expect(result).toBe(240);
    });
  });
});