/**
 * Fichier utilitaire pour les fonctions communes aux builders
 */

/**
 * Échappe une chaîne pour inclusion dans un url('...') CSS avec quotes simples.
 * Échappe les backslashes et les apostrophes.
 */
export function escapeForCssUrlSingleQuotes(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

/**
 * Échappe une chaîne pour inclusion dans du HTML.
 */
export function esc(s: any): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Formate un nombre en français sans décimales.
 */
export function numberFr0(n: number): string {
  return new Intl.NumberFormat('fr-FR', { 
    maximumFractionDigits: 0, 
    minimumFractionDigits: 0, 
    useGrouping: true 
  }).format(n)
}

/**
 * Retourne le nom du mois en français.
 */
export function monthName(d: Date): string {
  return d.toLocaleString('fr-FR', { month: 'long' })
}

/**
 * Convertit des coordonnées GPS en format DMS (Degrés, Minutes, Secondes).
 */
export function toDMS(lat: number, lon: number): string {
  const fmt = (deg: number, isLat: boolean) => {
    const d = Math.floor(Math.abs(deg))
    const mFloat = (Math.abs(deg) - d) * 60
    const m = Math.floor(mFloat)
    const s = (mFloat - m) * 60
    const hemi = isLat ? (deg >= 0 ? 'N' : 'S') : (deg >= 0 ? 'E' : 'W')
    return `${d}°${String(m).padStart(2,'0')}'${s.toFixed(2)}"${hemi}`
  }
  return `${fmt(lat, true)}, ${fmt(lon, false)}`
}

/**
 * Construit une valeur CSS url() avec gestion des data URLs.
 */
export function cssUrlValue(urlStr: string): string {
  return urlStr.startsWith('data:') 
    ? urlStr 
    : `'${escapeForCssUrlSingleQuotes(urlStr)}'`
}

/**
 * Mapping des codes pays vers leurs noms en français (majuscules).
 */
export const COUNTRY_FR: Record<string, string> = {
  fr: 'FRANCE', de: 'ALLEMAGNE', it: 'ITALIE', si: 'SLOVENIE', at: 'AUTRICHE',
  be: 'BELGIQUE', nl: 'PAYS-BAS', es: 'ESPAGNE', pt: 'PORTUGAL', ch: 'SUISSE',
  gb: 'ROYAUME-UNI', uk: 'ROYAUME-UNI', cz: 'REPUBLIQUE TCHEQUE', sk: 'SLOVAQUIE',
  hu: 'HONGRIE', hr: 'CROATIE', ba: 'BOSNIE-HERZEGOVINE', rs: 'SERBIE', me: 'MONTENEGRO',
  mk: 'MACEDOINE DU NORD', gr: 'GRECE', pl: 'POLOGNE', ro: 'ROUMANIE', bg: 'BULGARIE',
  dk: 'DANEMARK', no: 'NORVEGE', se: 'SUEDE', fi: 'FINLANDE', ee: 'ESTONIE',
  lv: 'LETTONIE', lt: 'LITUANIE', ie: 'IRLANDE', is: 'ISLANDE', lu: 'LUXEMBOURG',
  li: 'LIECHTENSTEIN', sm: 'SAINT-MARIN', va: 'VATICAN'
}

/**
 * Mapping des conditions météo vers leurs noms en français (majuscules).
 */
export const WEATHER_FR: Record<string, string> = {
  clear: 'ENSOLEILLEE', sunny: 'ENSOLEILLEE', clear_day: 'ENSOLEILLEE', clear_night: 'NUIT CLAIRE',
  mostly_sunny: 'PLUTOT ENSOLEILLE', partly_cloudy: 'PARTIELLEMENT NUAGEUX', partly_cloudy_day: 'PARTIELLEMENT NUAGEUX',
  cloudy: 'NUAGEUX', overcast: 'COUVERT', rain: 'PLUVIEUX', light_rain: 'PLUIE LEGERE', heavy_rain: 'FORTES PLUIES',
  drizzle: 'BRUINE', snow: 'NEIGE', sleet: 'NEIGE FONDUE', hail: 'GRELE', fog: 'BROUILLARD', wind: 'VENTEUX',
  thunderstorm: 'ORAGE'
}

/**
 * Normalise une clé en minuscules avec underscores.
 */
export function normKey(s: any): string {
  return String(s || '').toLowerCase().replace(/[^a-z]+/g, '_').replace(/^_|_$/g, '')
}

/**
 * Obtient le nom français d'un pays à partir de son code ISO.
 */
export function countryNameFrFromCode(code: string, fallback?: string): string {
  try {
    const Ctor: any = (Intl as any).DisplayNames
    if (Ctor) {
      const dn = new Ctor(['fr'], { type: 'region' })
      const name = dn.of(code?.toUpperCase?.())
      if (name) return String(name).toUpperCase()
    }
  } catch {}
  return (fallback || code || '').toString().toUpperCase()
}
