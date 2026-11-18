// POST /api/pesquisar
// Recebe { empresa, site?, cidade?, oferta? } e devolve dossiê, roteiro SPIN e persona.
// São duas chamadas ao Gemini: uma que pesquisa na web e outra que organiza o resultado.

import { gerarJSON, pesquisar, respostaDeErro } from "@/lib/gemini";
import { normalizarDossie, normalizarPersona, normalizarRoteiro } from "@/lib/normalizar";
import { OFERTA_PADRAO, promptEstruturar, promptPesquisa } from "@/lib/prompts";
import type { Entrada, ResultadoPesquisa } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const corpo = (await req.json()) as Partial<Entrada>;
    const empresa = corpo.empresa?.trim();
    if (!empresa) return Response.json({ erro: "Informe o nome da empresa." }, { status: 400 });

    const entrada: Entrada = {
      empresa,
      site: corpo.site?.trim() || undefined,
      cidade: corpo.cidade?.trim() || undefined,
      oferta: corpo.oferta?.trim() || OFERTA_PADRAO,
    };

    // 1) Pesquisa com Google Search. Se falhar, seguimos só com hipóteses em vez de travar o usuário.
    let notas = "";
    let fontes: ResultadoPesquisa["fontes"] = [];
    let consultas: string[] = [];
    try {
      const p = await pesquisar(promptPesquisa(entrada));
      notas = p.texto;
      fontes = p.fontes;
      consultas = p.consultas;
    } catch (e) {
      if (e instanceof Error && e.message.includes("GEMINI_API_KEY")) throw e;
      console.warn("[pauta] pesquisa falhou, seguindo sem notas:", e);
    }

    // 2) Organiza em dossiê + roteiro + persona.
    const bruto = await gerarJSON<Record<string, Record<string, unknown>>>(promptEstruturar(entrada, notas));

    const resultado: ResultadoPesquisa = {
      dossie: normalizarDossie(bruto.dossie, entrada.empresa),
      roteiro: normalizarRoteiro(bruto.roteiro),
      persona: normalizarPersona(bruto.persona),
      fontes,
      consultas,
    };
    return Response.json({ entrada, ...resultado });
  } catch (e) {
    return respostaDeErro(e);
  }
}
