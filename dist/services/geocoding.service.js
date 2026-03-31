const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';
function firstNonEmpty(...vals) {
    for (const v of vals) {
        const t = v?.trim();
        if (t)
            return t;
    }
    return null;
}
/** Rua (ou equivalente). */
function pickStreet(a) {
    return firstNonEmpty(a.road, a.pedestrian, a.residential, a.footway, a.path);
}
/** Bairro (ou equivalente). */
function pickNeighborhood(a) {
    return firstNonEmpty(a.suburb, a.neighbourhood, a.quarter, a.city_district);
}
/** Cidade (ou equivalente). */
function pickCity(a) {
    return firstNonEmpty(a.city, a.town, a.village, a.municipality);
}
/**
 * Monta apenas: rua, número, bairro, cidade (separados por vírgula).
 * Omite partes ausentes; retorna null se não houver nada útil.
 */
export function formatShortAddressFromNominatim(address) {
    const rua = pickStreet(address);
    const numero = firstNonEmpty(address.house_number, address.house_name);
    const bairro = pickNeighborhood(address);
    const cidade = pickCity(address);
    const parts = [];
    if (rua)
        parts.push(rua);
    if (numero)
        parts.push(numero);
    if (bairro)
        parts.push(bairro);
    if (cidade)
        parts.push(cidade);
    if (parts.length === 0)
        return null;
    return parts.join(', ');
}
/**
 * Converte coordenadas em endereço curto (rua, número, bairro, cidade).
 * Usa Nominatim (OSM); falhas retornam null sem lançar (o ponto continua válido só com lat/lng).
 */
export async function reverseGeocode(lat, lng, userAgent) {
    const url = new URL(NOMINATIM_REVERSE);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('format', 'json');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('accept-language', 'pt-BR,pt;q=0.9');
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': userAgent },
            signal: AbortSignal.timeout(12_000),
        });
        if (!res.ok)
            return null;
        const data = (await res.json());
        if (!data.address)
            return null;
        return formatShortAddressFromNominatim(data.address);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=geocoding.service.js.map