const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';

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

function firstNonEmpty(...vals: (string | undefined)[]): string | null {
  for (const v of vals) {
    const t = v?.trim();
    if (t) return t;
  }
  return null;
}

/** Rua (ou equivalente). */
function pickStreet(a: NominatimAddressParts): string | null {
  return firstNonEmpty(
    a.road,
    a.pedestrian,
    a.residential,
    a.footway,
    a.path
  );
}

/** Bairro (ou equivalente). */
function pickNeighborhood(a: NominatimAddressParts): string | null {
  return firstNonEmpty(
    a.suburb,
    a.neighbourhood,
    a.quarter,
    a.city_district
  );
}

/** Cidade (ou equivalente). */
function pickCity(a: NominatimAddressParts): string | null {
  return firstNonEmpty(
    a.city,
    a.town,
    a.village,
    a.municipality
  );
}

/**
 * Monta apenas: rua, número, bairro, cidade (separados por vírgula).
 * Omite partes ausentes; retorna null se não houver nada útil.
 */
export function formatShortAddressFromNominatim(
  address: NominatimAddressParts
): string | null {
  const rua = pickStreet(address);
  const numero = firstNonEmpty(address.house_number, address.house_name);
  const bairro = pickNeighborhood(address);
  const cidade = pickCity(address);

  const parts: string[] = [];
  if (rua) parts.push(rua);
  if (numero) parts.push(numero);
  if (bairro) parts.push(bairro);
  if (cidade) parts.push(cidade);

  if (parts.length === 0) return null;
  return parts.join(', ');
}

/**
 * Converte coordenadas em endereço curto (rua, número, bairro, cidade).
 * Usa Nominatim (OSM); falhas retornam null sem lançar (o ponto continua válido só com lat/lng).
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  userAgent: string
): Promise<string | null> {
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
    if (!res.ok) return null;
    const data = (await res.json()) as {
      address?: NominatimAddressParts;
    };
    if (!data.address) return null;
    return formatShortAddressFromNominatim(data.address);
  } catch {
    return null;
  }
}
