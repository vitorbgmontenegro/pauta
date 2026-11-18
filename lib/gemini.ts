// Camada fina sobre a API REST do Gemini.
// Usamos fetch direto (sem SDK) para ter controle total do corpo da requisição
// e não depender de mudanças de versão do pacote.
//
// Três formas de chamar o modelo:
//  - pesquisar(): liga a ferramenta google_search e devolve texto + fontes
//  - gerarJSON(): pede resposta em JSON e já devolve o objeto parseado
//  - conversar(): chat com instrução de sistema (usado no ensaio)

import type { Fonte } from "./types";

// GEMINI_BASE_URL só existe para testes locais com um servidor falso.
const BASE = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/models";

export class ErroConfig extends Error {}

function modelo() {
  return process.env.GEMINI_MODEL || "gemini-flash-latest";
}

type Conteudo = { role: "user" | "model"; parts: { text: string }[] };

type RespostaGemini = {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    groundingMetadata?: {
      webSearchQueries?: string[];
      groundingChunks?: { web?: { uri?: string; title?: string } }[];
    };
  }[];
};

async function chamar(corpo: Record<string, unknown>): Promise<RespostaGemini> {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) {
    throw new ErroConfig(
      "GEMINI_API_KEY não configurada. Crie uma chave em aistudio.google.com e coloque nas variáveis de ambiente.",
    );
  }

  const resp = await fetch(`${BASE}/${modelo()}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": chave },
    body: JSON.stringify(corpo),
  });

  if (!resp.ok) {
    const detalhe = await resp.text();
    throw new Error(`Gemini respondeu ${resp.status}: ${detalhe.slice(0, 400)}`);
  }
  return resp.json();
}

function textoDe(r: RespostaGemini): string {
  const partes = r.candidates?.[0]?.content?.parts ?? [];
  return partes.map((p) => p.text ?? "").join("").trim();
}

/** Pesquisa na web (Google Search grounding). Devolve as notas da pesquisa e as fontes citadas. */
export async function pesquisar(prompt: string) {
  const r = await chamar({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: { temperature: 0.3 },
  });

  const meta = r.candidates?.[0]?.groundingMetadata;
  const vistos = new Set<string>();
  const fontes: Fonte[] = [];
  for (const c of meta?.groundingChunks ?? []) {
    const url = c.web?.uri;
    if (!url || vistos.has(url)) continue;
    vistos.add(url);
    fontes.push({ titulo: c.web?.title || url, url });
  }

  return { texto: textoDe(r), fontes, consultas: meta?.webSearchQueries ?? [] };
}

/** Pede JSON ao modelo e devolve o objeto. Tolera a resposta vir embrulhada em ```json. */
export async function gerarJSON<T>(prompt: string, sistema?: string, temperatura = 0.6): Promise<T> {
  const r = await chamar({
    ...(sistema ? { systemInstruction: { parts: [{ text: sistema }] } } : {}),
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: temperatura, responseMimeType: "application/json" },
  });

  const bruto = textoDe(r).replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "");
  try {
    return JSON.parse(bruto) as T;
  } catch {
    // Última tentativa: pega do primeiro { até o último }.
    const ini = bruto.indexOf("{");
    const fim = bruto.lastIndexOf("}");
    if (ini >= 0 && fim > ini) return JSON.parse(bruto.slice(ini, fim + 1)) as T;
    throw new Error("A IA devolveu um JSON inválido. Tente de novo.");
  }
}

/** Uma rodada de conversa. O histórico alterna user/model e precisa começar com user. */
export async function conversar(sistema: string, historico: Conteudo[], temperatura = 0.9) {
  const r = await chamar({
    systemInstruction: { parts: [{ text: sistema }] },
    contents: historico,
    generationConfig: { temperature: temperatura },
  });
  return textoDe(r);
}

/** Converte um erro em resposta HTTP com mensagem legível na tela. */
export function respostaDeErro(e: unknown) {
  const status = e instanceof ErroConfig ? 503 : 500;
  const mensagem = e instanceof Error ? e.message : "Erro inesperado.";
  console.error("[pauta]", mensagem);
  return Response.json({ erro: mensagem }, { status });
}
