// Todos os prompts do produto ficam aqui, separados da lógica,
// para dar para ajustar o tom e o formato sem mexer nas rotas.

import type { Dossie, Entrada, Mensagem, Persona, Roteiro } from "./types";

export const OFERTA_PADRAO =
  "CITi, a empresa júnior de tecnologia do CIn/UFPE, em Recife. Desenvolve software sob medida: sistemas web, aplicativos, sites, automação de processos, integrações e projetos de dados e IA, com preço abaixo do mercado e acompanhamento próximo.";

const ESTILO = `Escreva em português do Brasil, com linguagem de conversa de negócio, direta e concreta.
Nada de frases genéricas de consultoria ("alavancar sinergias", "transformação digital" solto).
Cada item deve ser específico para ESTA empresa. Se uma informação não foi confirmada, diga que é hipótese.`;

/** Etapa 1: pesquisa na web. O modelo usa o Google Search e escreve notas livres. */
export function promptPesquisa(e: Entrada) {
  return `Você é um pesquisador de pré-venda B2B. Pesquise na web a empresa abaixo e escreva notas objetivas.

Empresa: ${e.empresa}
${e.site ? `Site: ${e.site}` : ""}
${e.cidade ? `Cidade/região: ${e.cidade}` : ""}

Levante, com o que for possível confirmar:
- o que a empresa faz, produtos/serviços, público, há quanto tempo existe
- porte aproximado (unidades, funcionários, faturamento se público)
- onde atua e quantas unidades
- presença digital: site, e-commerce, app, Instagram, Google Maps, avaliações e reclamações (Reclame Aqui, Google)
- notícias recentes: expansão, novas lojas, contratações, prêmios, problemas
- vagas abertas que revelem processos manuais ou sistemas usados
- quem são os donos ou diretores, se houver informação pública

Separe claramente o que foi confirmado do que é dedução. Não invente números.`;
}

/** Etapa 2: transforma as notas da pesquisa em dossiê, roteiro SPIN e persona para o ensaio. */
export function promptEstruturar(e: Entrada, notas: string) {
  return `Você prepara vendedores para reuniões de diagnóstico comercial usando o método SPIN Selling.

QUEM ESTÁ VENDENDO
${e.oferta}

EMPRESA-ALVO
${e.empresa}${e.cidade ? ` (${e.cidade})` : ""}

NOTAS DA PESQUISA NA WEB
${notas || "(a pesquisa não trouxe nada; trabalhe com hipóteses e deixe isso claro em incertezas)"}

${ESTILO}

Devolva SOMENTE um JSON com este formato:
{
  "dossie": {
    "empresa": "nome",
    "resumo": "2 ou 3 frases sobre o que a empresa é",
    "segmento": "",
    "porte": "",
    "localizacao": "",
    "presenca_digital": "1 ou 2 frases",
    "sinais": ["fatos encontrados que indicam oportunidade, com o fato concreto"],
    "dores_provaveis": [{"dor": "", "por_que": "qual sinal sugere isso"}],
    "encaixe_icp": {"nota": 0-10, "justificativa": "o quanto essa empresa combina com o que o vendedor oferece"},
    "oportunidades": [{"titulo": "solução possível", "descricao": "o que seria e que dor resolve"}],
    "incertezas": ["o que não foi confirmado e precisa ser perguntado na reunião"]
  },
  "roteiro": {
    "abertura": {
      "rapport": ["2 ou 3 ganchos de conversa baseados em fatos reais da empresa"],
      "agenda": "frase curta para alinhar o objetivo e o tempo da reunião"
    },
    "perguntas": [
      {"tipo": "Situação|Problema|Implicação|Necessidade", "pergunta": "", "objetivo": "o que essa pergunta quer descobrir", "info_para_proposta": "que informação ela gera para a proposta"}
    ],
    "objecoes": [{"objecao": "objeção provável deste cliente", "resposta": "como responder"}],
    "fechamento": {
      "resumo": "como resumir o que foi ouvido",
      "proximo_passo": "próximo passo concreto a propor",
      "frase": "frase exata para marcar o próximo passo com data"
    }
  },
  "persona": {
    "nome": "nome plausível de quem atenderia a reunião (se houver nome público do dono/diretor, use)",
    "cargo": "",
    "personalidade": "como essa pessoa se comporta numa reunião: ocupada, desconfiada, falante etc.",
    "dores_ocultas": ["3 a 5 problemas reais e específicos que a pessoa só revela se for bem perguntada"],
    "restricoes": ["orçamento, tempo, experiência ruim anterior, sócio que decide etc."]
  }
}

Regras do roteiro: 8 a 10 perguntas na ordem do SPIN (2-3 de Situação, 2-3 de Problema, 2 de Implicação, 2 de Necessidade).
Perguntas abertas, curtas, que um humano falaria. As de Situação não podem perguntar o que a pesquisa já respondeu.
Gere 2 ou 3 objeções.`;
}

/** Instrução de sistema do cliente simulado no ensaio. */
export function sistemaEnsaio(e: Entrada, d: Dossie, p: Persona) {
  return `Você é ${p.nome}, ${p.cargo} da empresa ${d.empresa}. Está numa reunião de diagnóstico com um vendedor de: ${e.oferta}

Sobre a sua empresa: ${d.resumo} Segmento: ${d.segmento}. Porte: ${d.porte}. Local: ${d.localizacao}.
Seu jeito: ${p.personalidade}

Problemas que você tem, mas NÃO conta de cara:
${p.dores_ocultas.map((x) => `- ${x}`).join("\n")}

Suas restrições:
${p.restricoes.map((x) => `- ${x}`).join("\n")}

Como agir:
- Responda como um empresário brasileiro real, em 1 a 4 frases, sem formalidade excessiva.
- Só revele um problema quando o vendedor fizer uma pergunta boa e específica sobre aquele assunto. Pergunta genérica recebe resposta genérica.
- Se o vendedor empurrar solução cedo demais, sem entender o problema, demonstre desinteresse ou desconfiança.
- Se o vendedor perguntar sobre impacto (quanto custa, quanto tempo perde), dê números plausíveis.
- Levante as suas restrições quando fizer sentido, como objeção.
- Nunca diga que é uma IA nem saia do personagem. Não use listas nem markdown.`;
}

/** Avaliação do ensaio: compara a conversa com o roteiro e com as dores ocultas. */
export function promptAvaliar(d: Dossie, r: Roteiro, p: Persona, mensagens: Mensagem[]) {
  const conversa = mensagens
    .map((m) => `${m.autor === "vendedor" ? "VENDEDOR" : p.nome.toUpperCase()}: ${m.texto}`)
    .join("\n");
  return `Você é um coach de vendas consultivas exigente e justo. Avalie o ensaio de reunião de diagnóstico abaixo.

Empresa: ${d.empresa}
Dores ocultas do cliente (o vendedor não sabia): ${JSON.stringify(p.dores_ocultas)}
Perguntas do roteiro preparado: ${JSON.stringify(r.perguntas.map((q) => q.pergunta))}

CONVERSA
${conversa}

Critérios: rapport e agenda no início, uso da sequência SPIN, perguntas abertas, escuta (aprofundou o que o cliente disse?),
se descobriu as dores ocultas, se evitou vender cedo demais, e se fechou com próximo passo concreto.

Devolva SOMENTE JSON:
{
  "nota": 0-10 (número, pode ter uma casa decimal),
  "resumo": "2 frases diretas sobre o desempenho",
  "pontos_fortes": ["cite trechos ou momentos concretos"],
  "faltou": ["o que faltou, concreto"],
  "dores_descobertas": ["dores ocultas que o vendedor fez o cliente revelar"],
  "dores_nao_descobertas": ["dores ocultas que ficaram escondidas"],
  "proxima_vez": ["2 ou 3 perguntas exatas que ele deveria ter feito"]
}`;
}

/** Proposta comercial a partir das anotações da reunião real (ou do ensaio). */
export function promptProposta(e: Entrada, d: Dossie, anotacoes: string) {
  return `Você escreve propostas comerciais curtas e convincentes para ${e.oferta}

Cliente: ${d.empresa} (${d.segmento}, ${d.localizacao})
Contexto da pesquisa: ${d.resumo}

ANOTAÇÕES DA REUNIÃO DE DIAGNÓSTICO
${anotacoes}

${ESTILO}
A proposta deve usar as palavras e os números que o cliente falou nas anotações. Não invente preço:
se não houver valor nas anotações, escreva em "investimento" que será apresentado após validação do escopo e diga o que define o valor.

Devolva SOMENTE JSON:
{
  "titulo": "título da proposta",
  "contexto": "1 parágrafo mostrando que entendemos o negócio",
  "problema": "1 parágrafo com o problema e o impacto, usando o que o cliente falou",
  "solucao": "1 parágrafo com a solução proposta",
  "etapas": [{"nome": "", "descricao": "", "prazo": "ex.: 2 semanas"}],
  "entregaveis": [""],
  "investimento": "",
  "proximos_passos": [""]
}`;
}
