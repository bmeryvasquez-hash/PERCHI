export const deliveryModes = [
  { value: "ENVIO", label: "Env\u00edo" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "PRESENCIAL_ENVIO", label: "Presencial y env\u00edos" }
];

export function formatDeliveryMode(value?: string) {
  return deliveryModes.find(mode => mode.value === value)?.label ?? "Presencial y env\u00edos";
}