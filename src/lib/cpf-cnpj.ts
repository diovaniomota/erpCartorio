// Pure CPF/CNPJ validation and masking — no external dependencies

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

// ─── Validators ───────────────────────────────────────────────────────────────

export function isValidCPF(value: string): boolean {
  const d = digits(value);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  const calcDigit = (limit: number): number => {
    let sum = 0;
    for (let i = 0; i < limit; i++) sum += Number(d[i]) * (limit + 1 - i);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  return calcDigit(9) === Number(d[9]) && calcDigit(10) === Number(d[10]);
}

export function isValidCNPJ(value: string): boolean {
  const d = digits(value);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;

  const calc = (weights: number[]): number => {
    const sum = weights.reduce((acc, w, i) => acc + Number(d[i]) * w, 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  return (
    calc([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(d[12]) &&
    calc([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) === Number(d[13])
  );
}

export function isValidCpfCnpj(value: string): boolean {
  const d = digits(value);
  if (d.length === 11) return isValidCPF(value);
  if (d.length === 14) return isValidCNPJ(value);
  return false;
}

// ─── Masks ────────────────────────────────────────────────────────────────────

export function maskCPF(value: string): string {
  const d = digits(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function maskCNPJ(value: string): string {
  const d = digits(value).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

// Auto-selects CPF mask for ≤11 digits, CNPJ for >11
export function maskCpfCnpj(value: string): string {
  const d = digits(value);
  return d.length > 11 ? maskCNPJ(d) : maskCPF(d);
}
