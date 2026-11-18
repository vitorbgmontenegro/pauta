// POST /api/ensaio/avaliar
// Recebe o lead e a conversa do ensaio e devolve nota, feedback e as dores que ficaram escondidas.

import { gerarJSON, respostaDeErro } from "@/lib/gemini";
import { normalizarAvaliacao } from "@/lib/normalizar";
import { promptAvaliar } from "@/lib/prompts";
import type { Avaliacao, Lead, Mensagem } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { lead, mensagens } = (await req.json()) as {
      lead: Pick<Lead, "dossie" | "roteiro" | "persona">;
      mensagens: Mensagem[];
    };
    if (!mensagens || mensagens.length < 2) {
      return Response.json({ erro: "Converse um pouco antes de pedir a avaliação." }, { status: 400 });
    }
    const bruto = await gerarJSON<Record<string, unknown>>(
      promptAvaliar(lead.dossie, lead.roteiro, lead.persona, mensagens),
      undefined,
      0.3,
    );
    const avaliacao: Avaliacao = normalizarAvaliacao(bruto);
    return Response.json(avaliacao);
  } catch (e) {
    return respostaDeErro(e);
  }
}
