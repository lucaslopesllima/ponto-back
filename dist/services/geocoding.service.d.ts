/** Campos comuns do objeto `address` na resposta JSON do Nominatim */
type NominatimAddressParts = {
    road?: string;
    pedestrian?: string;
    residential?: string;
    footway?: string;
    path?: string;
    house_number?: string;
    house_name?: string;
    suburb?: string;
    neighbourhood?: string;
    quarter?: string;
    city_district?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
};
/**
 * Monta apenas: rua, número, bairro, cidade (separados por vírgula).
 * Omite partes ausentes; retorna null se não houver nada útil.
 */
export declare function formatShortAddressFromNominatim(address: NominatimAddressParts): string | null;
/**
 * Converte coordenadas em endereço curto (rua, número, bairro, cidade).
 * Usa Nominatim (OSM); falhas retornam null sem lançar (o ponto continua válido só com lat/lng).
 */
export declare function reverseGeocode(lat: number, lng: number, userAgent: string): Promise<string | null>;
export {};
//# sourceMappingURL=geocoding.service.d.ts.map