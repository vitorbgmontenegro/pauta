// Tipos compartilhados entre as rotas de API (servidor) e as telas (cliente).
// Tudo o que a IA devolve passa por aqui, então se mudar um prompt, confira o tipo.

export type Fonte = { titulo: string; url: string };

/** O que o vendedor digita na tela inicial. */
export type Entrada = {
  empresa: string;
  site?: string;
  cidade?: string;
  /** O que quem está vendendo oferece. Padrão: serviços do CITi. */
  oferta: string;
};

export type Dossie = {
  empresa: string;
  resumo: string;
  segmento: string;
  porte: string;
  localizacao: string;
  presenca_digital: string;
  sinais: string[];
  dores_provaveis: { dor: string; por_que: string }[];
  encaixe_icp: { nota: number; justificativa: string };
  oportunidades: { titulo: string; descricao: string }[];
  /** Coisas que a pesquisa não conseguiu confirmar. Mostramos para o vendedor não chutar na reunião. */
  incertezas: string[];
};

export type TipoSpin = "Situação" | "Problema" | "Implicação" | "Necessidade";

export type PerguntaSpin = {
  tipo: TipoSpin;
  pergunta: string;
  objetivo: string;
  info_para_proposta: string;
};

export type Roteiro = {
  abertura: { rapport: string[]; agenda: string };
  perguntas: PerguntaSpin[];
  objecoes: { objecao: string; resposta: string }[];
  fechamento: { resumo: string; proximo_passo: string; frase: string };
};

/** O "cliente" que a IA interpreta no ensaio. As dores ocultas só aparecem se o vendedor perguntar bem. */
export type Persona = {
  nome: string;
  cargo: string;
  personalidade: string;
  dores_ocultas: string[];
  restricoes: string[];
};

export type Mensagem = { autor: "vendedor" | "cliente"; texto: string };

export type Avaliacao = {
  nota: number;
  resumo: string;
  pontos_fortes: string[];
  faltou: string[];
  dores_descobertas: string[];
  dores_nao_descobertas: string[];
  proxima_vez: string[];
};

export type Proposta = {
  titulo: string;
  contexto: string;
  problema: string;
  solucao: string;
  etapas: { nome: string; descricao: string; prazo: string }[];
  entregaveis: string[];
  investimento: string;
  proximos_passos: string[];
};

/** Um lead salvo no navegador, com tudo que foi gerado para ele. */
export type Lead = {
  id: string;
  criadoEm: string;
  exemplo?: boolean;
  entrada: Entrada;
  dossie: Dossie;
  roteiro: Roteiro;
  persona: Persona;
  fontes: Fonte[];
  consultas: string[];
  perguntasFeitas?: number[];
  ensaio?: { mensagens: Mensagem[]; avaliacao?: Avaliacao };
  anotacoes?: string;
  proposta?: Proposta;
};

/** Resposta da rota /api/pesquisar. */
export type ResultadoPesquisa = Pick<Lead, "dossie" | "roteiro" | "persona" | "fontes" | "consultas">;
