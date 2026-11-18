// POST /api/ensaio
// Uma rodada do ensaio: recebe o lead e o histórico, devolve a fala do cliente simulado.

import { conversar, respostaDeErro } from "@/lib/gemini";
import { sistemaEnsaio } from "@/lib/prompts";
import type { Lead, Mensagem } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { lead, mensagens } = (await req.json()) as {
      lead: Pick<Lead, "entrada" | "dossie" | "persona">;
      mensagens: Mensagem[];
    };
    if (!mensagens?.length || mensagens[0].autor !== "vendedor") {
      return Response.json({ erro: "A conversa precisa começar com a fala do vendedor." }, { status: 400 });
    }

    // Vendedor = "user", cliente = "model" no formato do Gemini.
    const historico = mensagens.map((m) => ({
      role: m.autor === "vendedor" ? ("user" as const) : ("model" as const),
      parts: [{ text: m.texto }],
    }));

    const texto = await conversar(sistemaEnsaio(lead.entrada, lead.dossie, lead.persona), historico);
    return Response.json({ texto });
  } catch (e) {
    return respostaDeErro(e);
  }
}
