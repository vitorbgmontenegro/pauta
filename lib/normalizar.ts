// A IA às vezes esquece um campo ou manda string onde era lista.
// Estas funções garantem o formato antes de a resposta chegar na tela, para nada quebrar com .map().

import type { Avaliacao, Dossie, Persona, Proposta, Roteiro, TipoSpin } from "./types";

type Bruto = Record<string, unknown> | undefined;

const txt = (v: unknown, padrao = "") => (typeof v === "string" ? v : v == null ? padrao : String(v));
const lista = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => txt(x)).filter(Boolean) : typeof v === "string" && v ? [v] : []);
const objs = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : []);
const nota = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(txt(v));
  return Number.isFinite(n) ? Math.max(0, Math.min(10, Math.round(n * 10) / 10)) : 0;
};
const TIPOS: TipoSpin[] = ["Situação", "Problema", "Implicação", "Necessidade"];
const tipo = (v: unknown): TipoSpin => TIPOS.find((t) => txt(v).toLowerCase().startsWith(t.slice(0, 4).toLowerCase())) ?? "Situação";

export function normalizarDossie(d: Bruto, empresa: string): Dossie {
  const icp = (d?.encaixe_icp ?? {}) as Bruto;
  return {
    empresa: txt(d?.empresa, empresa) || empresa,
    resumo: txt(d?.resumo),
    segmento: txt(d?.segmento, "Não identificado"),
    porte: txt(d?.porte, "Não identificado"),
    localizacao: txt(d?.localizacao, "Não identificada"),
    presenca_digital: txt(d?.presenca_digital),
    sinais: lista(d?.sinais),
    dores_provaveis: objs(d?.dores_provaveis).map((x) => ({ dor: txt(x.dor), por_que: txt(x.por_que) })),
    encaixe_icp: { nota: nota(icp?.nota), justificativa: txt(icp?.justificativa) },
    oportunidades: objs(d?.oportunidades).map((x) => ({ titulo: txt(x.titulo), descricao: txt(x.descricao) })),
    incertezas: lista(d?.incertezas),
  };
}

export function normalizarRoteiro(r: Bruto): Roteiro {
  const ab = (r?.abertura ?? {}) as Bruto;
  const fe = (r?.fechamento ?? {}) as Bruto;
  return {
    abertura: { rapport: lista(ab?.rapport), agenda: txt(ab?.agenda) },
    perguntas: objs(r?.perguntas).map((q) => ({
      tipo: tipo(q.tipo),
      pergunta: txt(q.pergunta),
      objetivo: txt(q.objetivo),
      info_para_proposta: txt(q.info_para_proposta),
    })),
    objecoes: objs(r?.objecoes).map((o) => ({ objecao: txt(o.objecao), resposta: txt(o.resposta) })),
    fechamento: { resumo: txt(fe?.resumo), proximo_passo: txt(fe?.proximo_passo), frase: txt(fe?.frase) },
  };
}

export function normalizarPersona(p: Bruto): Persona {
  return {
    nome: txt(p?.nome, "Cliente") || "Cliente",
    cargo: txt(p?.cargo, "Responsável"),
    personalidade: txt(p?.personalidade),
    dores_ocultas: lista(p?.dores_ocultas),
    restricoes: lista(p?.restricoes),
  };
}

export function normalizarAvaliacao(a: Bruto): Avaliacao {
  return {
    nota: nota(a?.nota),
    resumo: txt(a?.resumo),
    pontos_fortes: lista(a?.pontos_fortes),
    faltou: lista(a?.faltou),
    dores_descobertas: lista(a?.dores_descobertas),
    dores_nao_descobertas: lista(a?.dores_nao_descobertas),
    proxima_vez: lista(a?.proxima_vez),
  };
}

export function normalizarProposta(p: Bruto): Proposta {
  return {
    titulo: txt(p?.titulo, "Proposta comercial"),
    contexto: txt(p?.contexto),
    problema: txt(p?.problema),
    solucao: txt(p?.solucao),
    etapas: objs(p?.etapas).map((e) => ({ nome: txt(e.nome), descricao: txt(e.descricao), prazo: txt(e.prazo) })),
    entregaveis: lista(p?.entregaveis),
    investimento: txt(p?.investimento, "A definir após validação do escopo."),
    proximos_passos: lista(p?.proximos_passos),
  };
}
