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

/**
 * Ordem de modelos a tentar. Se o primeiro estiver sobrecarregado (503) ou no limite (429),
 * o app tenta de novo e depois passa para o próximo. GEMINI_MODEL, se existir, vem primeiro.
 */
function modelos() {
  const lista = [process.env.GEMINI_MODEL, "gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash"];
  return [...new Set(lista.filter(Boolean) as string[])];
}

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Erros que valem nova tentativa: sobrecarga, limite de uso e falha temporária do servidor. */
const TEMPORARIOS = new Set([429, 500, 502, 503, 504]);

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

type Opcoes = {
  /** Tempo máximo de cada chamada. Passou disso, desiste e tenta o próximo modelo. */
  limiteMs: number;
  /** Pede raciocínio curto ao modelo. Usado no chat, onde a resposta precisa ser rápida. */
  pensarPouco?: boolean;
};

/** Configuração de "pensamento": Gemini 3 usa thinkingLevel, a família 2.5 usa thinkingBudget. */
function configPensamento(m: string) {
  return m.startsWith("gemini-2") ? { thinkingBudget: 0 } : { thinkingLevel: "low" };
}

async function chamar(corpo: Record<string, unknown>, opcoes: Opcoes): Promise<RespostaGemini> {
  const chave = process.env.GEMINI_API_KEY;
  if (!chave) {
    throw new ErroConfig(
      "GEMINI_API_KEY não configurada. Crie uma chave em aistudio.google.com e coloque nas variáveis de ambiente.",
    );
  }

  let ultimoStatus = 0;
  let ultimoDetalhe = "";

  // Para cada modelo: até 2 tentativas, com uma pausa curta entre elas.
  for (const m of modelos()) {
    let comPensamento = Boolean(opcoes.pensarPouco);

    for (let tentativa = 0; tentativa < 2; tentativa++) {
      const gen = (corpo.generationConfig ?? {}) as Record<string, unknown>;
      const corpoFinal = comPensamento
        ? { ...corpo, generationConfig: { ...gen, thinkingConfig: configPensamento(m) } }
        : corpo;

      let resp: Response;
      try {
        resp = await fetch(`${BASE}/${m}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": chave },
          body: JSON.stringify(corpoFinal),
          signal: AbortSignal.timeout(opcoes.limiteMs),
        });
      } catch (e) {
        // Estourou o tempo (ou caiu a conexão): não insiste neste modelo, vai para o próximo.
        ultimoStatus = 504;
        console.warn(`[pauta] ${m} não respondeu em ${opcoes.limiteMs / 1000}s:`, e instanceof Error ? e.name : e);
        break;
      }
      if (resp.ok) return resp.json();

      ultimoStatus = resp.status;
      ultimoDetalhe = (await resp.text()).slice(0, 300);
      console.warn(`[pauta] ${m} respondeu ${resp.status} (tentativa ${tentativa + 1})`);

      // Se o modelo não aceitou a configuração de pensamento, tenta de novo sem ela.
      if (resp.status === 400 && comPensamento && /thinking/i.test(ultimoDetalhe)) {
        comPensamento = false;
        continue;
      }
      // 404 = modelo não existe para esta chave; 429 = cota desse modelo acabou (esperar não resolve).
      // Nos dois casos, pula direto para o próximo modelo da lista.
      if (resp.status === 404 || resp.status === 429) break;
      if (!TEMPORARIOS.has(resp.status)) throw new Error(`Gemini respondeu ${resp.status}: ${ultimoDetalhe}`);
      if (tentativa === 0) await esperar(1500);
    }
  }

  if (ultimoStatus === 429) {
    throw new Error("Limite de uso da IA atingido por agora. Espere um minuto e tente de novo.");
  }
  if (ultimoStatus === 504) {
    throw new Error("A IA demorou demais para responder. Tente de novo.");
  }
  throw new Error(`A IA está sobrecarregada no momento (erro ${ultimoStatus}). Tente de novo em alguns segundos.`);
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
  }, { limiteMs: 50_000 });

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
  }, { limiteMs: 50_000 });

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
  }, { limiteMs: 20_000, pensarPouco: true });
  const texto = textoDe(r);
  if (!texto) throw new Error("O cliente ficou sem resposta. Tente mandar a mensagem de novo.");
  return texto;
}

/** Converte um erro em resposta HTTP com mensagem legível na tela. */
export function respostaDeErro(e: unknown) {
  const status = e instanceof ErroConfig ? 503 : 500;
  const mensagem = e instanceof Error ? e.message : "Erro inesperado.";
  console.error("[pauta]", mensagem);
  return Response.json({ erro: mensagem }, { status });
}
