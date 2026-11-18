// Lead de exemplo, com empresa FICTÍCIA, para quem abre o app pela primeira vez
// conseguir ver as três etapas (preparar, ensaiar, propor) sem gastar chamada de IA.

import { OFERTA_PADRAO } from "./prompts";
import type { Lead } from "./types";

export const LEAD_EXEMPLO: Lead = {
  id: "exemplo",
  criadoEm: "2026-11-18T12:00:00.000Z",
  exemplo: true,
  entrada: { empresa: "Mercadinho Boa Vista (fictício)", cidade: "Recife, PE", oferta: OFERTA_PADRAO },
  dossie: {
    empresa: "Mercadinho Boa Vista",
    resumo:
      "Rede familiar de mercadinhos de bairro com três lojas na Zona Norte do Recife. Vende mercearia, hortifruti e padaria própria, com forte clientela de vizinhança e entregas por WhatsApp.",
    segmento: "Varejo alimentar de vizinhança",
    porte: "Pequeno porte, cerca de 45 funcionários nas três lojas",
    localizacao: "Recife, Zona Norte (Casa Amarela, Tamarineira e Encruzilhada)",
    presenca_digital:
      "Instagram ativo com ofertas da semana e pedidos pelo WhatsApp. Não tem site nem loja online. Nota 4,5 no Google, com reclamações recorrentes de demora na entrega.",
    sinais: [
      "Abriu a terceira loja há oito meses, o que costuma bagunçar estoque e compras",
      "Vaga aberta de auxiliar administrativo para 'controle de planilhas de estoque'",
      "Avaliações no Google citam pedido de WhatsApp esquecido e entrega atrasada",
    ],
    dores_provaveis: [
      { dor: "Estoque controlado em planilha, separado por loja", por_que: "a vaga pede alguém para cuidar de planilhas de estoque" },
      { dor: "Pedidos de WhatsApp sem fila nem controle", por_que: "as reclamações no Google falam de pedido esquecido" },
      { dor: "Perda de hortifruti e padaria por falta de previsão", por_que: "comum em rede pequena que cresceu rápido" },
    ],
    encaixe_icp: {
      nota: 8,
      justificativa:
        "Varejo de Pernambuco em crescimento, com processos manuais claros e dor que se resolve com sistema sob medida de porte pequeno. Bom encaixe para um primeiro projeto.",
    },
    oportunidades: [
      { titulo: "Central de pedidos do WhatsApp", descricao: "Fila única de pedidos das três lojas, com status para o cliente e para o entregador." },
      { titulo: "Estoque unificado", descricao: "Painel com estoque das três lojas e alerta de reposição, substituindo as planilhas." },
      { titulo: "Previsão de perecíveis", descricao: "Sugestão de quanto produzir de pão e comprar de hortifruti por dia, a partir do histórico de vendas." },
    ],
    incertezas: [
      "Qual sistema de caixa (PDV) eles usam e se ele exporta as vendas",
      "Quem decide a compra de tecnologia: o dono ou os filhos que tocam as lojas novas",
    ],
  },
  roteiro: {
    abertura: {
      rapport: [
        "Parabéns pela loja da Encruzilhada, como foi abrir a terceira unidade?",
        "Vi que a padaria de vocês é muito elogiada no Google. O pão é feito em cada loja ou numa só?",
      ],
      agenda:
        "A ideia hoje é eu entender como funciona o dia a dia de vocês, uns 30 minutos. No fim, se fizer sentido, a gente combina um próximo passo. Pode ser?",
    },
    perguntas: [
      { tipo: "Situação", pergunta: "Como chega um pedido de WhatsApp até sair para entrega hoje?", objetivo: "Mapear o fluxo de pedidos e quem participa", info_para_proposta: "Desenho do processo atual e número de pessoas envolvidas" },
      { tipo: "Situação", pergunta: "Como vocês sabem o que tem em estoque em cada loja?", objetivo: "Entender ferramentas e rotina de estoque", info_para_proposta: "Sistemas usados e integrações necessárias" },
      { tipo: "Problema", pergunta: "O que costuma dar errado num dia de muito pedido?", objetivo: "Fazer o cliente nomear a dor com as palavras dele", info_para_proposta: "Problema principal, na linguagem do cliente" },
      { tipo: "Problema", pergunta: "Já aconteceu de faltar produto numa loja enquanto sobrava na outra?", objetivo: "Confirmar a dor de estoque separado", info_para_proposta: "Frequência e exemplos reais" },
      { tipo: "Implicação", pergunta: "Quando um pedido se perde, o que acontece com aquele cliente?", objetivo: "Ligar a dor a perda de receita e de cliente", info_para_proposta: "Impacto em vendas e reputação" },
      { tipo: "Implicação", pergunta: "Quanto de pão e verdura vocês jogam fora numa semana normal?", objetivo: "Dar um número para o desperdício", info_para_proposta: "Valor de perda para justificar o investimento" },
      { tipo: "Necessidade", pergunta: "Se os pedidos das três lojas caíssem numa fila só, o que mudaria para a equipe?", objetivo: "Cliente descrever o valor da solução", info_para_proposta: "Benefício esperado nas palavras dele" },
      { tipo: "Necessidade", pergunta: "O que precisaria ser verdade para isso valer o investimento para vocês?", objetivo: "Descobrir critério de decisão e orçamento", info_para_proposta: "Critérios de sucesso e faixa de investimento" },
    ],
    objecoes: [
      { objecao: "A gente já tentou um sistema e a equipe não usou.", resposta: "Pergunte o que fez a equipe largar. Mostre que o sistema é feito em cima do processo deles, com treinamento na loja." },
      { objecao: "Agora não é hora, acabamos de investir na loja nova.", resposta: "Volte para o número de perdas que ele mesmo falou e proponha começar só pela parte que dá retorno mais rápido." },
    ],
    fechamento: {
      resumo: "Repita as duas ou três dores que ele falou, com os números que ele deu.",
      proximo_passo: "Marcar uma visita à loja de Casa Amarela num dia de movimento para ver o processo funcionando.",
      frase: "Faz sentido eu ir na loja de Casa Amarela num sábado de manhã para ver isso de perto? Quinta eu te mando a proposta.",
    },
  },
  persona: {
    nome: "Seu Arlindo",
    cargo: "Dono e fundador",
    personalidade: "Desconfiado com tecnologia, objetivo, fala pouco no começo e se abre quando o assunto é dinheiro perdido.",
    dores_ocultas: [
      "Perde cerca de 15% do pão produzido por dia",
      "Dois pedidos de WhatsApp por dia se perdem no celular da loja",
      "O filho que cuida da loja nova reclama que nunca sabe o estoque das outras",
      "Pagou um sistema há dois anos que ninguém usou",
    ],
    restricoes: ["Acabou de investir na terceira loja", "Decide junto com o filho mais velho"],
  },
  fontes: [],
  consultas: [],
  ensaio: {
    mensagens: [
      { autor: "vendedor", texto: "Seu Arlindo, obrigado pelo tempo. A ideia hoje é eu entender o dia a dia das lojas, uns 30 minutos. Como foi abrir a terceira loja?" },
      { autor: "cliente", texto: "Foi corrido, viu. Loja nova dá trabalho. Mas vamo lá, o que vocês fazem mesmo?" },
      { autor: "vendedor", texto: "A gente faz sistema sob medida, mas antes quero entender vocês. Como chega um pedido de WhatsApp até sair a entrega?" },
      { autor: "cliente", texto: "Chega no celular da loja, a menina anota no caderno e separa. Às vezes no sábado fica muita mensagem e uma ou outra passa." },
      { autor: "vendedor", texto: "E quando uma passa, o que acontece com aquele cliente?" },
      { autor: "cliente", texto: "Ele reclama, né. Já perdi cliente antigo por isso. Uns dois pedidos por dia se perdem, se for contar." },
    ],
    avaliacao: {
      nota: 7.5,
      resumo: "Boa abertura e boa pergunta de implicação, que fez ele dar um número. Faltou explorar estoque e desperdício, onde estava a dor mais cara.",
      pontos_fortes: ["Alinhou agenda e tempo logo no início", "Segurou a vontade de explicar o produto quando ele perguntou", "Transformou 'uma ou outra passa' em 'dois pedidos por dia'"],
      faltou: ["Não perguntou sobre a padaria nem sobre perdas", "Não fechou com próximo passo"],
      dores_descobertas: ["Dois pedidos de WhatsApp por dia se perdem no celular da loja"],
      dores_nao_descobertas: ["Perde cerca de 15% do pão produzido por dia", "O filho da loja nova não sabe o estoque das outras", "Pagou um sistema há dois anos que ninguém usou"],
      proxima_vez: ["Quanto de pão sobra no fim do dia?", "Como o seu filho sabe o que tem nas outras lojas?", "Vocês já usaram algum sistema antes? Como foi?"],
    },
  },
  anotacoes:
    "Pedidos de WhatsApp chegam no celular de cada loja e são anotados em caderno. Perde uns 2 pedidos por dia, mais no sábado. Já perdeu cliente antigo. Sobra uns 15% do pão por dia. Filho cuida da loja nova e não vê estoque das outras. Usaram um sistema há 2 anos e ninguém usou porque era complicado. Querem algo simples. Decide com o filho.",
  proposta: {
    titulo: "Central de Pedidos e Estoque do Mercadinho Boa Vista",
    contexto:
      "O Mercadinho Boa Vista cresceu para três lojas atendendo a vizinhança pelo balcão e pelo WhatsApp, e a operação continua apoiada em caderno e planilha.",
    problema:
      "Hoje cerca de dois pedidos de WhatsApp se perdem por dia, e já houve perda de cliente antigo por isso. Cada loja enxerga só o próprio estoque, e em torno de 15% do pão produzido sobra no fim do dia.",
    solucao:
      "Um sistema simples, pensado para quem está no balcão: todos os pedidos de WhatsApp das três lojas entram numa fila única com status, e um painel mostra o estoque das lojas em tempo real. Numa segunda fase, sugerimos a quantidade de pão a produzir com base nas vendas.",
    etapas: [
      { nome: "Imersão nas lojas", descricao: "Acompanhar um sábado de movimento e desenhar o fluxo junto com a equipe", prazo: "1 semana" },
      { nome: "Fila de pedidos", descricao: "Central de pedidos do WhatsApp com status, testada primeiro em Casa Amarela", prazo: "4 semanas" },
      { nome: "Estoque unificado", descricao: "Painel de estoque das três lojas com alerta de reposição", prazo: "4 semanas" },
    ],
    entregaveis: ["Sistema web funcionando nas três lojas", "Treinamento da equipe na própria loja", "Acompanhamento de 30 dias após a entrega"],
    investimento:
      "Será apresentado após a imersão, quando o escopo estiver validado. O valor depende principalmente da integração com o caixa atual.",
    proximos_passos: ["Visita à loja de Casa Amarela no sábado", "Reunião com Seu Arlindo e o filho para validar o escopo"],
  },
};
