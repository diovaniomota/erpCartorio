export const DEFAULT_AGENDA_TIPOS = [
  "reunião",
  "boleto",
  "contrato",
  "férias",
  "atestado",
  "LGPD",
  "tarefa",
  "tribunal",
  "manutenção",
  "treinamento",
  "manual",
];

export function normalizeAgendaTipos(input: unknown) {
  const values = Array.isArray(input)
    ? input
    : isRecord(input) && Array.isArray(input.items)
      ? input.items
      : isRecord(input) && Array.isArray(input.tipos)
        ? input.tipos
        : [];

  const seen = new Set<string>();
  return values
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .filter((value) => {
      const key = value.toLocaleLowerCase("pt-BR");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 40);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
