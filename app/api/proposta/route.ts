// POST /api/proposta
// Recebe o lead e as anotações da reunião e devolve a proposta comercial estruturada.

import { gerarJSON, respostaDeErro } from "@/lib/gemini";
import { normalizarProposta } from "@/lib/normalizar";
import { promptProposta } from "@/lib/prompts";
import type { Lead, Proposta } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { lead, anotacoes } = (await req.json()) as {
      lead: Pick<Lead, "entrada" | "dossie">;
      anotacoes: string;
    };
    if (!anotacoes || anotacoes.trim().length < 20) {
      return Response.json({ erro: "Escreva as anotações da reunião (pelo menos algumas linhas)." }, { status: 400 });
    }
    const bruto = await gerarJSON<Record<string, unknown>>(promptProposta(lead.entrada, lead.dossie, anotacoes), undefined, 0.5);
    const proposta: Proposta = normalizarProposta(bruto);
    return Response.json(proposta);
  } catch (e) {
    return respostaDeErro(e);
  }
}
