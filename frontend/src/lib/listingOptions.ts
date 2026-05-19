export const clothingTypes = [
  { value: "ACCESORIOS", label: "Accesorios" },
  { value: "BLUSA", label: "Blusa" },
  { value: "BOTAS_BOTINES", label: "Botas/Botines" },
  { value: "CALZAS", label: "Calzas" },
  { value: "CHAQUETA", label: "Chaqueta" },
  { value: "ENTERITO", label: "Enterito" },
  { value: "FALDA", label: "Falda" },
  { value: "FALDA_SHORT", label: "Falda short" },
  { value: "JEANS", label: "Jeans" },
  { value: "LEGGINS", label: "Leggins" },
  { value: "OTRO", label: "Otro" },
  { value: "PARKA", label: "Parka" },
  { value: "POLERA", label: "Polera" },
  { value: "POLERON", label: "Poleron" },
  { value: "SANDALIAS", label: "Sandalias" },
  { value: "SHORT", label: "Short" },
  { value: "SWEATER", label: "Sweater" },
  { value: "TOP", label: "Top" },
  { value: "VESTIDO", label: "Vestido" },
  { value: "ZAPATILLAS", label: "Zapatillas" },
  { value: "ZAPATOS", label: "Zapatos" }
];

export const clothingStyles = [
  { value: "BOHO", label: "Boho" },
  { value: "CASUAL", label: "Casual" },
  { value: "COQUETTE", label: "Coquette" },
  { value: "DEPORTIVO", label: "Deportivo" },
  { value: "FORMAL", label: "Formal" },
  { value: "GOTICO", label: "Gotico" },
  { value: "RAVE", label: "Rave" },
  { value: "URBANO", label: "Urbano" }
];

export const clothingConditions = [
  { value: "BUENO", label: "Bueno" },
  { value: "COMO_NUEVO", label: "Como nuevo" },
  { value: "CON_DETALLES", label: "Con detalles" },
  { value: "MUY_BUENO", label: "Muy bueno" },
  { value: "NUEVO_CON_ETIQUETA", label: "Nuevo con etiqueta" }
];

function findLabel(options: { value: string; label: string }[], value?: string) {
  return options.find(option => option.value === value)?.label ?? value ?? "Sin definir";
}

export function formatType(value?: string) {
  return findLabel(clothingTypes, value);
}

export function formatStyle(value?: string) {
  return findLabel(clothingStyles, value);
}

export function formatCondition(value?: string) {
  return findLabel(clothingConditions, value);
}