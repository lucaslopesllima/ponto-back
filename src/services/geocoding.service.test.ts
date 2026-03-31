import { describe, expect, it } from 'vitest';
import { formatShortAddressFromNominatim } from './geocoding.service.js';

describe('formatShortAddressFromNominatim', () => {
  it('monta rua, número, bairro e cidade', () => {
    expect(
      formatShortAddressFromNominatim({
        road: 'Rua das Acácias',
        house_number: '42',
        suburb: 'Centro',
        city: 'Curitiba',
      })
    ).toBe('Rua das Acácias, 42, Centro, Curitiba');
  });

  it('omite partes ausentes', () => {
    expect(
      formatShortAddressFromNominatim({
        road: 'Av. Paulista',
        city: 'São Paulo',
      })
    ).toBe('Av. Paulista, São Paulo');
  });

  it('retorna null sem dados úteis', () => {
    expect(formatShortAddressFromNominatim({})).toBeNull();
  });
});
