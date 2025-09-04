// Map service: compute top/left percentage for a point within a country's bounding box
// Mirrors Python map_manager.calculate_position_percentage logic using simple linear interpolation.

export interface LatLon {
  lat: number;
  lon: number;
}

export interface BoundingBox {
  sw: LatLon; // south-west corner
  ne: LatLon; // north-east corner
}

export type CountryBoundingBoxes = Record<string, BoundingBox>;

let cache: CountryBoundingBoxes | null = null;

async function loadBoxes(): Promise<CountryBoundingBoxes> {
  if (cache) return cache;
  const res = await fetch('/data/country_bounding_boxes.json');
  if (!res.ok) throw new Error(`Failed to load country_bounding_boxes.json: ${res.status}`);
  cache = (await res.json()) as CountryBoundingBoxes;
  return cache!;
}

export async function getPositionPercentage(
  countryCode: string,
  point: LatLon
): Promise<{ top: number; left: number } | null> {
  const boxes = await loadBoxes();
  const box = boxes[countryCode.toLowerCase()];
  if (!box) return null;

  const { sw, ne } = box;
  // Clamp lat/lon into bbox range to avoid negatives or >100%
  const lat = Math.min(Math.max(point.lat, sw.lat), ne.lat);
  const lon = Math.min(Math.max(point.lon, sw.lon), ne.lon);

  const latSpan = ne.lat - sw.lat;
  const lonSpan = ne.lon - sw.lon;
  if (latSpan <= 0 || lonSpan <= 0) return null;

  // In CSS: top increases downward. Lat increases northward (up).
  // So invert the Y-axis mapping: top% = (ne.lat - lat) / span * 100
  const top = ((ne.lat - lat) / latSpan) * 100;
  const left = ((lon - sw.lon) / lonSpan) * 100;

  return { top, left };
}
