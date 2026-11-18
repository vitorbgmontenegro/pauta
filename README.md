# Pauta

**Caderno de diagnóstico comercial com IA.** Você digita o nome de uma empresa e a Pauta:

1. **Prepara**: pesquisa a empresa na web (Gemini com Google Search) e monta um dossiê com sinais, dores prováveis, encaixe no ICP e o roteiro da reunião no método SPIN, com abertura, perguntas, objeções e fechamento.
2. **Ensaia**: cria um cliente simulado com problemas escondidos. Você treina a reunião por chat e recebe nota, feedback e a lista do que ficou sem descobrir.
3. **Propõe**: transforma as anotações da reunião numa proposta comercial pronta pra copiar ou salvar em PDF.

Feito por Vitor Montenegro para o Desafio de Inovação do processo seletivo do CITi (nov/2026).

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # coloque sua GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

A chave é gratuita em https://aistudio.google.com/apikey.

## Subir na Vercel

1. Suba este repositório no GitHub.
2. Em vercel.com → **Add New → Project**, importe o repositório (o framework Next.js é detectado sozinho).
3. Em **Environment Variables**, adicione `GEMINI_API_KEY`. `GEMINI_MODEL` é opcional (padrão `gemini-flash-latest`).
4. Clique em **Deploy**.

## Estrutura

```
app/
  page.tsx                 tela inicial: formulário e lista de reuniões
  lead/[id]/page.tsx       página do lead com as abas Preparar, Ensaiar e Propor
  api/pesquisar            pesquisa na web + dossiê + roteiro + persona (2 chamadas ao Gemini)
  api/ensaio               uma fala do cliente simulado
  api/ensaio/avaliar       nota e feedback do ensaio
  api/proposta             anotações → proposta
components/                Preparar, Ensaiar e Propor (uma aba por arquivo)
lib/
  gemini.ts                chamadas REST ao Gemini (pesquisa, JSON, chat)
  prompts.ts               todos os prompts do produto
  normalizar.ts            garante o formato do JSON que a IA devolve
  storage.ts               leads salvos no localStorage do navegador
  exemplo.ts               lead de exemplo com empresa fictícia
  types.ts                 tipos compartilhados
```

## Decisões

- **Sem banco de dados no MVP.** Os leads ficam no navegador de quem usa, o que deixa o deploy em um clique e não guarda dados de terceiros num servidor. O próximo passo natural é Supabase com login por empresa júnior.
- **Duas chamadas na pesquisa.** A primeira usa a ferramenta de busca e escreve notas livres; a segunda organiza tudo em JSON. Separar deixa cada etapa mais confiável do que pedir busca e JSON juntos.
- **Dores ocultas no ensaio.** O cliente simulado recebe problemas que só revela se o vendedor perguntar bem. É isso que transforma o chat em treino de verdade.
- **Sem preço inventado.** A proposta só fala em valor se ele aparecer nas anotações.
