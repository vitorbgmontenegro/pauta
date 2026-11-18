// Persistência no navegador (localStorage). Cada pessoa vê só os próprios leads.
// Tudo dentro de try/catch porque o localStorage pode estar bloqueado (aba anônima, iframe).

import { LEAD_EXEMPLO } from "./exemplo";
import type { Lead } from "./types";

const CHAVE = "pauta:leads:v1";

function ler(): Lead[] {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as Lead[]) : [];
  } catch {
    return [];
  }
}

function gravar(leads: Lead[]) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(leads));
  } catch {
    /* sem armazenamento: o app continua funcionando na sessão */
  }
}

/** Lista os leads, mais recentes primeiro. O exemplo sempre aparece no fim. */
export function listarLeads(): Lead[] {
  const salvos = ler().filter((l) => !l.exemplo);
  const exemplo = ler().find((l) => l.exemplo) ?? LEAD_EXEMPLO;
  return [...salvos.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)), exemplo];
}

export function buscarLead(id: string): Lead | undefined {
  return ler().find((l) => l.id === id) ?? (id === LEAD_EXEMPLO.id ? LEAD_EXEMPLO : undefined);
}

export function salvarLead(lead: Lead) {
  const outros = ler().filter((l) => l.id !== lead.id);
  gravar([...outros, lead]);
}

export function apagarLead(id: string) {
  gravar(ler().filter((l) => l.id !== id));
}

export function novoId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
