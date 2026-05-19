export type LocationOption = {
  value: string;
  label: string;
  lat?: number;
  lon?: number;
};

function byLabel(a: LocationOption, b: LocationOption) {
  return a.label.localeCompare(b.label, "es");
}

export const cityOptions: LocationOption[] = [
  { value: "antofagasta", label: "Antofagasta", lat: -23.6509, lon: -70.3975 },
  { value: "arica", label: "Arica", lat: -18.4783, lon: -70.3126 },
  { value: "calama", label: "Calama", lat: -22.4544, lon: -68.9294 },
  { value: "castro", label: "Castro", lat: -42.4721, lon: -73.7732 },
  { value: "chillan", label: "Chill\u00e1n", lat: -36.6066, lon: -72.1034 },
  { value: "concepcion", label: "Concepci\u00f3n", lat: -36.8201, lon: -73.0444 },
  { value: "copiapo", label: "Copiap\u00f3", lat: -27.3668, lon: -70.3323 },
  { value: "coquimbo", label: "Coquimbo", lat: -29.9533, lon: -71.3436 },
  { value: "curico", label: "Curic\u00f3", lat: -34.9828, lon: -71.2394 },
  { value: "iquique", label: "Iquique", lat: -20.2307, lon: -70.1357 },
  { value: "la serena", label: "La Serena", lat: -29.9027, lon: -71.2519 },
  { value: "linares", label: "Linares", lat: -35.8467, lon: -71.5931 },
  { value: "los angeles", label: "Los \u00c1ngeles", lat: -37.4697, lon: -72.3537 },
  { value: "osorno", label: "Osorno", lat: -40.5740, lon: -73.1335 },
  { value: "puerto montt", label: "Puerto Montt", lat: -41.4693, lon: -72.9424 },
  { value: "punta arenas", label: "Punta Arenas", lat: -53.1638, lon: -70.9171 },
  { value: "rancagua", label: "Rancagua", lat: -34.1708, lon: -70.7444 },
  { value: "san antonio", label: "San Antonio", lat: -33.5922, lon: -71.6217 },
  { value: "santiago", label: "Santiago", lat: -33.4489, lon: -70.6693 },
  { value: "talca", label: "Talca", lat: -35.4264, lon: -71.6554 },
  { value: "temuco", label: "Temuco", lat: -38.7359, lon: -72.5904 },
  { value: "valdivia", label: "Valdivia", lat: -39.8142, lon: -73.2459 },
  { value: "valparaiso", label: "Valpara\u00edso", lat: -33.0472, lon: -71.6127 },
  { value: "vina del mar", label: "Vi\u00f1a del Mar", lat: -33.0245, lon: -71.5518 }
].sort(byLabel);

const communeNames = [
  "Algarrobo", "Alhue", "Alto Biobio", "Alto del Carmen", "Alto Hospicio", "Ancud", "Andacollo", "Angol", "Antartica", "Antofagasta", "Antuco", "Arauco", "Arica", "Aysen", "Buin", "Bulnes", "Cabildo", "Cabo de Hornos", "Cabrero", "Calama", "Calbuco", "Caldera", "Calera", "Calera de Tango", "Calle Larga", "Camarones", "Canela", "Carahue", "Cartagena", "Casablanca", "Castro", "Catemu", "Cauquenes", "Cerrillos", "Cerro Navia", "Chaiten", "Chanco", "Cha�aral", "Chepica", "Chiguayante", "Chile Chico", "Chillan", "Chillan Viejo", "Chimbarongo", "Cholchol", "Chonchi", "Cisnes", "Cobquecura", "Cochamo", "Cochrane", "Codegua", "Coelemu", "Coihaique", "Coihueco", "Coinco", "Colbun", "Colchane", "Colina", "Collipulli", "Coltauco", "Combarbala", "Concepcion", "Conchali", "Concon", "Constitucion", "Contulmo", "Copiapo", "Coquimbo", "Coronel", "Corral", "Cunco", "Curacautin", "Curacavi", "Curaco de Velez", "Curanilahue", "Curarrehue", "Curepto", "Curico", "Dalcahue", "Diego de Almagro", "Do�ihue", "El Bosque", "El Carmen", "El Monte", "El Quisco", "El Tabo", "Empedrado", "Ercilla", "Estacion Central", "Florida", "Freire", "Freirina", "Fresia", "Frutillar", "Futaleufu", "Futrono", "Galvarino", "General Lagos", "Gorbea", "Graneros", "Guaitecas", "Hijuelas", "Hualaihue", "Huala�e", "Hualpen", "Hualqui", "Huara", "Huasco", "Huechuraba", "Illapel", "Independencia", "Iquique", "Isla de Maipo", "Isla de Pascua", "Juan Fernandez", "La Cisterna", "La Cruz", "La Estrella", "La Florida", "La Granja", "La Higuera", "La Ligua", "La Pintana", "La Reina", "La Serena", "Lago Ranco", "Lago Verde", "Laguna Blanca", "Laja", "Lampa", "Lanco", "Las Cabras", "Las Condes", "Lautaro", "Lebu", "Licanten", "Limache", "Linares", "Litueche", "Llanquihue", "Llay-Llay", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Lolol", "Loncoche", "Longavi", "Lonquimay", "Los Alamos", "Los Andes", "Los Angeles", "Los Lagos", "Los Muermos", "Los Sauces", "Los Vilos", "Lota", "Lumaco", "Machali", "Macul", "Maipu", "Malloa", "Marchigue", "Maria Elena", "Maria Pinto", "Mariquina", "Maule", "Maullin", "Mejillones", "Melipeuco", "Melipilla", "Molina", "Monte Patria", "Mostazal", "Mulchen", "Nacimiento", "Nancagua", "Natales", "Navidad", "Negrete", "Ninhue", "Nogales", "Nueva Imperial", "�iquen", "�u�oa", "O'Higgins", "Olivar", "Ollag�e", "Olmue", "Osorno", "Ovalle", "Padre Hurtado", "Padre Las Casas", "Paiguano", "Paillaco", "Paine", "Palena", "Palmilla", "Panguipulli", "Panquehue", "Papudo", "Paredones", "Parral", "Pedro Aguirre Cerda", "Pelarco", "Pelluhue", "Pemuco", "Pencahue", "Penco", "Pe�aflor", "Pe�alolen", "Peralillo", "Perquenco", "Petorca", "Peumo", "Pica", "Pichidegua", "Pichilemu", "Pinto", "Pirque", "Pitrufquen", "Placilla", "Portezuelo", "Porvenir", "Pozo Almonte", "Primavera", "Providencia", "Puchuncavi", "Pucon", "Pudahuel", "Puente Alto", "Puerto Montt", "Puerto Octay", "Puerto Varas", "Pumanque", "Punitaqui", "Punta Arenas", "Puqueldon", "Puren", "Purranque", "Putaendo", "Putre", "Puyehue", "Queilen", "Quellon", "Quemchi", "Quilaco", "Quilicura", "Quilleco", "Quillon", "Quillota", "Quilpue", "Quinchao", "Quinta de Tilcoco", "Quinta Normal", "Quintero", "Quirihue", "Rancagua", "Ranquil", "Rauco", "Recoleta", "Renaico", "Renca", "Rengo", "Requinoa", "Retiro", "Rinconada", "Rio Bueno", "Rio Claro", "Rio Hurtado", "Rio Iba�ez", "Rio Negro", "Rio Verde", "Romeral", "Saavedra", "Sagrada Familia", "Salamanca", "San Antonio", "San Bernardo", "San Carlos", "San Clemente", "San Esteban", "San Fabian", "San Felipe", "San Fernando", "San Gregorio", "San Ignacio", "San Javier", "San Joaquin", "San Jose de Maipo", "San Juan de la Costa", "San Miguel", "San Nicolas", "San Pablo", "San Pedro", "San Pedro de Atacama", "San Pedro de la Paz", "San Rafael", "San Ramon", "San Rosendo", "San Vicente", "Santa Barbara", "Santa Cruz", "Santa Juana", "Santa Maria", "Santiago", "Santo Domingo", "Sierra Gorda", "Talagante", "Talca", "Talcahuano", "Taltal", "Temuco", "Teno", "Teodoro Schmidt", "Tierra Amarilla", "Tiltil", "Timaukel", "Tirua", "Tocopilla", "Tolten", "Tome", "Torres del Paine", "Tortel", "Traiguen", "Treguaco", "Tucapel", "Valdivia", "Vallenar", "Valparaiso", "Vichuquen", "Victoria", "Vicu�a", "Vilcun", "Villa Alegre", "Villa Alemana", "Villarrica", "Vina del Mar", "Vitacura", "Yerbas Buenas", "Yumbel", "Yungay", "Zapallar"
];

const communeCoordinates: Record<string, Pick<LocationOption, "lat" | "lon">> = {
  "Puente Alto": { lat: -33.6117, lon: -70.5758 },
  "Santiago": { lat: -33.4489, lon: -70.6693 },
  "Vina del Mar": { lat: -33.0245, lon: -71.5518 },
  "Vi\u00f1a del Mar": { lat: -33.0245, lon: -71.5518 },
  "Valparaiso": { lat: -33.0472, lon: -71.6127 },
  "Providencia": { lat: -33.4263, lon: -70.6117 },
  "Las Condes": { lat: -33.4117, lon: -70.55 },
  "La Florida": { lat: -33.5225, lon: -70.5983 },
  "Maipu": { lat: -33.5103, lon: -70.7569 },
  "�u�oa": { lat: -33.4569, lon: -70.5975 },
  "Concepcion": { lat: -36.8201, lon: -73.0444 },
  "Temuco": { lat: -38.7359, lon: -72.5904 },
  "La Serena": { lat: -29.9027, lon: -71.2519 },
  "Rancagua": { lat: -34.1708, lon: -70.7444 },
  "Talca": { lat: -35.4264, lon: -71.6554 },
  "Antofagasta": { lat: -23.6509, lon: -70.3975 },
  "Iquique": { lat: -20.2307, lon: -70.1357 },
  "Arica": { lat: -18.4783, lon: -70.3126 },
  "Puerto Montt": { lat: -41.4693, lon: -72.9424 },
  "Punta Arenas": { lat: -53.1638, lon: -70.9171 }
};

function formatLocationLabel(label: string) {
  const replacements: Record<string, string> = {
    "Cha\ufffdaral": "Cha\u00f1aral",
    "Do\ufffdihue": "Do\u00f1ihue",
    "Huala\ufffde": "Huala\u00f1\u00e9",
    "\ufffdiquen": "\u00d1iqu\u00e9n",
    "\ufffdu\ufffdoa": "\u00d1u\u00f1oa",
    "Ollag\ufffde": "Ollag\u00fce",
    "Pe\ufffdaflor": "Pe\u00f1aflor",
    "Pe\ufffdalolen": "Pe\u00f1alol\u00e9n",
    "Rio Iba\ufffdez": "R\u00edo Ib\u00e1\u00f1ez",
    "Vicu\ufffda": "Vicu\u00f1a",    "Cha\u00ef\u00bf\u00bdaral": "Cha\u00f1aral",
    "Do\u00ef\u00bf\u00bdihue": "Do\u00f1ihue",
    "Huala\u00ef\u00bf\u00bde": "Huala\u00f1\u00e9",
    "\u00ef\u00bf\u00bdiquen": "\u00d1iqu\u00e9n",
    "\u00ef\u00bf\u00bdu\u00ef\u00bf\u00bdoa": "\u00d1u\u00f1oa",
    "Ollag\u00ef\u00bf\u00bde": "Ollag\u00fce",
    "Pe\u00ef\u00bf\u00bdaflor": "Pe\u00f1aflor",
    "Pe\u00ef\u00bf\u00bdalolen": "Pe\u00f1alol\u00e9n",
    "Rio Iba\u00ef\u00bf\u00bdez": "R\u00edo Ib\u00e1\u00f1ez",
    "Vicu\u00ef\u00bf\u00bda": "Vicu\u00f1a",
    "Chillan": "Chill\u00e1n",
    "Concepcion": "Concepci\u00f3n",
    "Copiapo": "Copiap\u00f3",
    "Curico": "Curic\u00f3",
    "Los Angeles": "Los \u00c1ngeles",
    "Valparaiso": "Valpara\u00edso",
    "Vina del Mar": "Vi\u00f1a del Mar"
  };

  return replacements[label] ?? label;
}
function normalizeLocationText(value?: string) {
  return value?.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") ?? "";
}

export const communeOptions: LocationOption[] = communeNames
  .map(label => {
    const displayLabel = formatLocationLabel(label);
    const cityCoordinates = cityOptions.find(city => normalizeLocationText(city.label) === normalizeLocationText(displayLabel));
    return {
      value: displayLabel,
      label: displayLabel,
      ...(cityCoordinates ? { lat: cityCoordinates.lat, lon: cityCoordinates.lon } : {}),
      ...communeCoordinates[label]
    };
  })
  .sort(byLabel);


const cityCommuneGroups: Record<string, string[]> = {
  santiago: [
    "Cerrillos", "Cerro Navia", "Conchali", "El Bosque", "Estacion Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipu", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolen", "Providencia", "Pudahuel", "Puente Alto", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Bernardo", "San Joaquin", "San Miguel", "San Ramon", "Santiago", "Vitacura"
  ],
  antofagasta: ["Antofagasta"],
  arica: ["Arica"],
  calama: ["Calama"],
  castro: ["Castro"],
  chillan: ["Chillán", "Chillan", "Chillan Viejo"],
  concepcion: ["Concepción", "Concepcion", "Chiguayante", "Hualpen", "Hualqui", "Penco", "San Pedro de la Paz", "Talcahuano"],
  copiapo: ["Copiapó", "Copiapo"],
  coquimbo: ["Coquimbo"],
  curico: ["Curicó", "Curico"],
  iquique: ["Iquique", "Alto Hospicio"],
  "la serena": ["La Serena"],
  linares: ["Linares"],
  "los angeles": ["Los Ángeles", "Los Angeles"],
  osorno: ["Osorno"],
  "puerto montt": ["Puerto Montt"],
  "punta arenas": ["Punta Arenas"],
  rancagua: ["Rancagua", "Machali"],
  "san antonio": ["San Antonio", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo"],
  talca: ["Talca"],
  temuco: ["Temuco", "Padre Las Casas"],
  valdivia: ["Valdivia"],
  valparaiso: ["Valparaíso", "Valparaiso"],
  "vina del mar": ["Viña del Mar", "Vina del Mar"]
};

export function getCommuneOptionsForCity(city?: string) {
  const normalizedCity = normalizeLocationText(city);
  if (!normalizedCity) return communeOptions;

  const allowed = cityCommuneGroups[normalizedCity];
  if (!allowed) {
    const directMatch = communeOptions.filter(option => normalizeLocationText(option.label) === normalizedCity);
    return directMatch.length > 0 ? directMatch : communeOptions;
  }

  const allowedSet = new Set(allowed.map(normalizeLocationText));
  return communeOptions.filter(option => allowedSet.has(normalizeLocationText(option.label)));
}
export function findCity(value?: string) {
  const normalized = normalizeLocationText(value);
  return cityOptions.find(option => normalizeLocationText(option.value) === normalized || normalizeLocationText(option.label) === normalized) ?? null;
}

export function findCommune(value?: string) {
  const normalized = normalizeLocationText(value);
  return communeOptions.find(option => normalizeLocationText(option.value) === normalized || normalizeLocationText(option.label) === normalized) ?? null;
}