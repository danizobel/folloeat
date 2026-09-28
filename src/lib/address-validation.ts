/**
 * Address Validation & Geocoding for FolloEat (Follonica 58022)
 * Validates delivery addresses and merchant addresses within the municipality of Follonica.
 */

export interface AddressValidationResult {
  isValid: boolean;
  isInFollonica: boolean;
  hasHouseNumber: boolean;
  streetName?: string;
  houseNumber?: string;
  zone: 'Centro' | 'Lungomare' | 'Senzuno' | 'Pratoranieri' | 'Cassarello' | 'Altra Zona';
  normalizedAddress: string;
  isBeachPoint: boolean;
  beachPointName?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  warning?: string;
  error?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Bounding box for Follonica municipality
export const FOLLONICA_BBOX = {
  minLat: 42.895,
  maxLat: 42.955,
  minLng: 10.705,
  maxLng: 10.815
};

// Known streets categorized by zone
export const FOLLONICA_STREETS = [
  // Centro
  { name: 'Via Roma', zone: 'Centro' as const, center: [42.9242, 10.7585] },
  { name: 'Via Bicocchi', zone: 'Centro' as const, center: [42.9238, 10.7592] },
  { name: 'Piazza Sivieri', zone: 'Centro' as const, center: [42.9235, 10.7580] },
  { name: 'Piazza del Popolo', zone: 'Centro' as const, center: [42.9221, 10.7588] },
  { name: 'Piazza Guerrazzi', zone: 'Centro' as const, center: [42.9229, 10.7596] },
  { name: 'Via Marconi', zone: 'Centro' as const, center: [42.9248, 10.7570] },
  { name: 'Via Matteotti', zone: 'Centro' as const, center: [42.9252, 10.7577] },
  { name: 'Via Colombo', zone: 'Centro' as const, center: [42.9240, 10.7568] },
  { name: 'Via Fratti', zone: 'Centro' as const, center: [42.9231, 10.7572] },
  { name: 'Via Carducci', zone: 'Centro' as const, center: [42.9250, 10.7558] },
  { name: 'Via Norma Pratelli Parenti', zone: 'Centro' as const, center: [42.9225, 10.7601] },
  { name: 'Via Cavour', zone: 'Centro' as const, center: [42.9244, 10.7599] },
  { name: 'Via Gorizia', zone: 'Centro' as const, center: [42.9255, 10.7605] },
  { name: 'Via Lamarmora', zone: 'Centro' as const, center: [42.9237, 10.7610] },

  // Lungomare
  { name: 'Viale Italia', zone: 'Lungomare' as const, center: [42.9258, 10.7482] },
  { name: 'Lungomare Carducci', zone: 'Lungomare' as const, center: [42.9233, 10.7548] },
  { name: 'Piazza a Mare', zone: 'Lungomare' as const, center: [42.9226, 10.7554] },
  { name: 'Piazza XXV Aprile', zone: 'Lungomare' as const, center: [42.9245, 10.7525] },

  // Senzuno & Foce Gora
  { name: 'Via della Repubblica', zone: 'Senzuno' as const, center: [42.9192, 10.7608] },
  { name: 'Via Curtatone', zone: 'Senzuno' as const, center: [42.9188, 10.7614] },
  { name: 'Via Solferino', zone: 'Senzuno' as const, center: [42.9184, 10.7621] },
  { name: 'Via Goito', zone: 'Senzuno' as const, center: [42.9180, 10.7628] },
  { name: 'Via Firenze', zone: 'Senzuno' as const, center: [42.9175, 10.7635] },
  { name: 'Via Pisa', zone: 'Senzuno' as const, center: [42.9171, 10.7640] },
  { name: 'Via Lucca', zone: 'Senzuno' as const, center: [42.9168, 10.7645] },
  { name: 'Via Palermo', zone: 'Senzuno' as const, center: [42.9162, 10.7650] },
  { name: 'Via Spiaggia di Levante', zone: 'Senzuno' as const, center: [42.9190, 10.7600] },

  // Pratoranieri
  { name: 'Via Litoranea', zone: 'Pratoranieri' as const, center: [42.9325, 10.7320] },
  { name: 'Via Isole Tremiti', zone: 'Pratoranieri' as const, center: [42.9315, 10.7335] },
  { name: 'Via Lipari', zone: 'Pratoranieri' as const, center: [42.9320, 10.7330] },
  { name: 'Via Capri', zone: 'Pratoranieri' as const, center: [42.9330, 10.7315] },
  { name: 'Via Elba', zone: 'Pratoranieri' as const, center: [42.9335, 10.7305] },
  { name: 'Via Giglio', zone: 'Pratoranieri' as const, center: [42.9340, 10.7295] },
  { name: 'Via Ponza', zone: 'Pratoranieri' as const, center: [42.9328, 10.7322] },

  // Cassarello & 167
  { name: 'Via Cassarello', zone: 'Cassarello' as const, center: [42.9165, 10.7705] },
  { name: 'Via Massetana', zone: 'Cassarello' as const, center: [42.9205, 10.7735] },
  { name: 'Via Sanzio', zone: 'Cassarello' as const, center: [42.9155, 10.7720] },
  { name: 'Via Salgari', zone: 'Cassarello' as const, center: [42.9148, 10.7740] },
  { name: 'Via Rodari', zone: 'Cassarello' as const, center: [42.9142, 10.7750] },
  { name: 'Via Collodi', zone: 'Cassarello' as const, center: [42.9138, 10.7760] },
  { name: 'Via Don Minzoni', zone: 'Cassarello' as const, center: [42.9178, 10.7685] },
  { name: 'Via Amendola', zone: 'Cassarello' as const, center: [42.9212, 10.7665] },
  { name: 'Via Golfo di Baratti', zone: 'Cassarello' as const, center: [42.9130, 10.7770] },
];

// Recognized beach establishments in Follonica
export const FOLLONICA_BEACH_POINTS = [
  { name: 'Bagno Florida', zone: 'Lungomare' as const, coords: [42.9254, 10.7495] },
  { name: 'Bagno Balena', zone: 'Lungomare' as const, coords: [42.9246, 10.7515] },
  { name: 'Bagno Cerboli', zone: 'Lungomare' as const, coords: [42.9262, 10.7475] },
  { name: 'Bagno Roma', zone: 'Lungomare' as const, coords: [42.9240, 10.7532] },
  { name: 'Bagno Miramare', zone: 'Lungomare' as const, coords: [42.9236, 10.7540] },
  { name: 'Bagno Nettuno', zone: 'Lungomare' as const, coords: [42.9248, 10.7510] },
  { name: 'Bagno Aloha', zone: 'Lungomare' as const, coords: [42.9265, 10.7460] },
  { name: 'Bagno Ausonia', zone: 'Lungomare' as const, coords: [42.9242, 10.7526] },
  { name: 'Bagno Eden', zone: 'Lungomare' as const, coords: [42.9250, 10.7505] },
  { name: 'Bagno Pagni', zone: 'Lungomare' as const, coords: [42.9259, 10.7485] },
  { name: 'Bagno Sirena', zone: 'Senzuno' as const, coords: [42.9210, 10.7570] },
  { name: 'Bagno Giardino', zone: 'Senzuno' as const, coords: [42.9195, 10.7595] },
  { name: 'Bagno Ippocampo', zone: 'Senzuno' as const, coords: [42.9185, 10.7610] },
  { name: 'Bagno Tramontana', zone: 'Pratoranieri' as const, coords: [42.9315, 10.7340] },
  { name: 'Bagno Oasi', zone: 'Pratoranieri' as const, coords: [42.9330, 10.7310] },
  { name: 'Bagno Mamai', zone: 'Pratoranieri' as const, coords: [42.9345, 10.7285] },
];

// Cities outside Follonica that must trigger out-of-boundary warnings
const OUT_OF_BOUNDS_KEYWORDS = [
  'piombino', 'grosseto', 'scarlino', 'massa marittima', 'castiglione', 'gavorrano', 
  'riotorto', 'venturina', 'campiglia', 'san vincenzo', 'cecina', 'livorno', 'pisa', 'firenze'
];

/**
 * Validates an address string against the Follonica municipality rules.
 */
export function validateFollonicaAddress(rawAddress: string, zoneHint?: string): AddressValidationResult {
  const trimmed = (rawAddress || '').trim();

  if (!trimmed) {
    return {
      isValid: false,
      isInFollonica: false,
      hasHouseNumber: false,
      zone: (zoneHint as any) || 'Centro',
      normalizedAddress: '',
      isBeachPoint: false,
      error: 'Inserisci un indirizzo di consegna a Follonica.',
      confidence: 'LOW'
    };
  }

  const lower = trimmed.toLowerCase();

  // Check for out of bounds neighboring cities
  for (const city of OUT_OF_BOUNDS_KEYWORDS) {
    if (lower.includes(city) && !lower.includes('follonica')) {
      return {
        isValid: false,
        isInFollonica: false,
        hasHouseNumber: false,
        zone: 'Altra Zona',
        normalizedAddress: trimmed,
        isBeachPoint: false,
        error: `FolloEat effettua consegne solo a Follonica (CAP 58022). La località "${city}" è fuori copertura.`,
        confidence: 'HIGH'
      };
    }
  }

  // 1. Check if it's a recognized beach point or chalet
  const isBeachContext = lower.includes('bagno') || lower.includes('spiaggia') || lower.includes('chalet') || lower.includes('ombrellone');
  const matchedBeach = isBeachContext
    ? FOLLONICA_BEACH_POINTS.find(b => 
        lower.includes(b.name.toLowerCase()) || 
        lower.includes(b.name.toLowerCase().replace('bagno ', ''))
      )
    : undefined;

  if (matchedBeach || (isBeachContext && (lower.includes('spiaggia') || lower.includes('bagno') || lower.includes('ombrellone')))) {
    const beachName = matchedBeach ? matchedBeach.name : trimmed;
    const zone = matchedBeach ? matchedBeach.zone : (zoneHint as any) || 'Lungomare';
    const coords = matchedBeach ? { lat: matchedBeach.coords[0], lng: matchedBeach.coords[1] } : { lat: 42.9255, lng: 10.7485 };

    return {
      isValid: true,
      isInFollonica: true,
      hasHouseNumber: true, // Beach delivery uses umbrella/spot number
      streetName: beachName,
      zone,
      normalizedAddress: `Spiaggia - ${beachName}, Follonica`,
      isBeachPoint: true,
      beachPointName: beachName,
      coordinates: coords,
      confidence: 'HIGH'
    };
  }

  // 2. Street matching
  let matchedStreet = FOLLONICA_STREETS.find(s => lower.includes(s.name.toLowerCase())) ||
    FOLLONICA_STREETS.find(s => {
      const bareName = s.name.toLowerCase().replace(/^(via|viale|piazza)\s+/i, '');
      const regex = new RegExp(`\\b${bareName}\\b`, 'i');
      return regex.test(lower);
    });

  // Extract house number: digits optionally followed by a/b/c/bis or /n
  const houseNumRegex = /(?:n\.?|civico|civ\.?)?\s*(\d{1,4}(?:\s*[a-zA-Z]|\s*\/\s*\d+)?)(?:\b|$)/i;
  const matchNum = trimmed.match(houseNumRegex);
  const houseNumber = matchNum ? matchNum[1].trim() : undefined;
  const hasHouseNumber = !!houseNumber;

  let zone: AddressValidationResult['zone'] = matchedStreet ? matchedStreet.zone : (zoneHint as any) || 'Centro';

  // Specific street heuristics if no exact match
  if (!matchedStreet) {
    if (lower.includes('italia') || lower.includes('mare') || lower.includes('litor')) {
      zone = 'Lungomare';
    } else if (lower.includes('senzuno') || lower.includes('repubblica') || lower.includes('gora')) {
      zone = 'Senzuno';
    } else if (lower.includes('prato') || lower.includes('litoranea')) {
      zone = 'Pratoranieri';
    } else if (lower.includes('cassar') || lower.includes('massetana') || lower.includes('sanzio') || lower.includes('167')) {
      zone = 'Cassarello';
    } else if (lower.includes('roma') || lower.includes('bicocchi') || lower.includes('sivieri') || lower.includes('stazione')) {
      zone = 'Centro';
    }
  }

  const streetName = matchedStreet ? matchedStreet.name : trimmed.split(',')[0].replace(/\d+.*/, '').trim();

  // Compute estimated coordinates
  let lat = 42.9230;
  let lng = 10.7565;

  if (matchedStreet) {
    lat = matchedStreet.center[0];
    lng = matchedStreet.center[1];
    // Small offset for house number
    if (houseNumber) {
      const numVal = parseInt(houseNumber, 10);
      if (!isNaN(numVal)) {
        lat += (numVal % 20) * 0.00008;
        lng += (numVal % 20) * 0.00008;
      }
    }
  }

  // Format clean standardized address
  const cleanNumber = houseNumber ? ` ${houseNumber}` : '';
  const normalizedAddress = `${streetName}${cleanNumber}, 58022 Follonica (GR)`;

  // If house number is missing, warn the user
  let warning: string | undefined = undefined;
  if (!hasHouseNumber) {
    warning = 'Consiglio: inserisci anche il numero civico (es. Via Roma 15) per agevolare la consegna del rider.';
  }

  return {
    isValid: true,
    isInFollonica: true,
    hasHouseNumber,
    streetName,
    houseNumber,
    zone,
    normalizedAddress,
    isBeachPoint: false,
    coordinates: { lat, lng },
    warning,
    confidence: matchedStreet ? 'HIGH' : 'MEDIUM'
  };
}

/**
 * Live geocode validation with OpenStreetMap Nominatim, bounded to Follonica.
 */
export async function geocodeAddressOSM(address: string): Promise<AddressValidationResult> {
  const localResult = validateFollonicaAddress(address);

  // If local validation already found a fatal error (e.g. wrong city), return early
  if (!localResult.isValid || localResult.isBeachPoint) {
    return localResult;
  }

  try {
    const q = `${address}, Follonica, Italy`;
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      q
    )}&viewbox=${FOLLONICA_BBOX.minLng},${FOLLONICA_BBOX.maxLat},${FOLLONICA_BBOX.maxLng},${
      FOLLONICA_BBOX.minLat
    }&bounded=1&limit=3`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FolloEat-Applet/1.0 (info@folloeat.it)'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lon);

        // Check if inside Follonica bounding box
        if (
          lat >= FOLLONICA_BBOX.minLat &&
          lat <= FOLLONICA_BBOX.maxLat &&
          lng >= FOLLONICA_BBOX.minLng &&
          lng <= FOLLONICA_BBOX.maxLng
        ) {
          localResult.coordinates = { lat, lng };
          localResult.confidence = 'HIGH';
        }
      }
    }
  } catch (err) {
    // Fallback to local heuristic without throwing
    console.warn('Nominatim geocode fallback to local rules:', err);
  }

  return localResult;
}
