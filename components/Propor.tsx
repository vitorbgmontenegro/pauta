"use client";

// Aba 03: anotações da reunião (real ou do ensaio) viram uma proposta comercial.
// A proposta é exibida como documento e pode ser copiada ou salva em PDF pela impressão do navegador.

import { useState } from "react";
import { postar } from "@/lib/api";
import type { Lead, Proposta } from "@/lib/types";

type Props = { lead: Lead; atualizar: (m: Partial<Lead>) => void };

function propostaEmTexto(p: Proposta) {
  return [
    p.titulo, "",
    "Contexto", p.contexto, "",
    "O problema", p.problema, "",
    "A solução", p.solucao, "",
    "Etapas", ...p.etapas.map((e, i) => `${i + 1}. ${e.nome} (${e.prazo}): ${e.descricao}`), "",
    "Entregáveis", ...p.entregaveis.map((e) => `- ${e}`), "",
    "Investimento", p.investimento, "",
    "Próximos passos", ...p.proximos_passos.map((e) => `- ${e}`),
  ].join("\n");
}

export default function Propor({ lead, atualizar }: Props) {
  const [anotacoes, setAnotacoes] = useState(lead.anotacoes ?? "");
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState("");
  const [copiado, setCopiado] = useState(false);
  const p = lead.proposta;

  async function gerar() {
    setErro("");
    setGerando(true);
    atualizar({ anotacoes });
    try {
      const proposta = await postar<Proposta>("/api/proposta", {
        lead: { entrada: lead.entrada, dossie: lead.dossie },
        anotacoes,
      });
      atualizar({ proposta, anotacoes });
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao gerar a proposta.");
    } finally {
      setGerando(false);
    }
  }

  async function copiar() {
    if (!p) return;
    try {
      await navigator.clipboard.writeText(propostaEmTexto(p));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      setErro("Não consegui copiar. Selecione o texto manualmente.");
    }
  }

  return (
    <div className="duas-colunas">
      <div className="coluna col-esq nao-imprimir">
        <section className="bloco">
          <div className="bloco-cab"><h2 className="titulo-secao">Anotações da reunião</h2></div>
          <p className="pequeno texto-suave" style={{ margin: 0 }}>
            Cole o que o cliente falou: problemas, números, prazos, quem decide. Quanto mais palavras dele, melhor a proposta.
          </p>
          <div className="campo">
            <textarea
              value={anotacoes}
              onChange={(e) => setAnotacoes(e.target.value)}
              rows={14}
              placeholder="Ex.: perde uns 2 pedidos por dia no WhatsApp, estoque em planilha separada por loja, quer começar pela loja X…"
            />
          </div>
          {erro && <div className="erro">{erro}</div>}
          <div className="acoes">
            <button className="botao" onClick={gerar} disabled={gerando || anotacoes.trim().length < 20}>
              {gerando ? "Escrevendo a proposta…" : p ? "Gerar de novo" : "Gerar proposta"}
            </button>
          </div>
        </section>

        <section className="incerteza">
          <span className="rotulo">Lembre do roteiro</span>
          <span className="pequeno">Próximo passo combinado: {lead.roteiro.fechamento.proximo_passo}</span>
        </section>
      </div>

      <div className="coluna col-dir">
        {!p && !gerando && (
          <div className="chat-vazio" style={{ padding: "60px 0" }}>
            <span className="titulo-secao">A proposta aparece aqui.</span>
            <span className="pequeno">Ela usa o dossiê da pesquisa e as suas anotações, sem inventar preço.</span>
          </div>
        )}
        {gerando && <p className="texto-suave">Escrevendo com as palavras do cliente…</p>}
        {p && (
          <>
            <div className="acoes nao-imprimir">
              <button className="botao botao-claro botao-mini" onClick={copiar}>{copiado ? "Copiado ✓" : "Copiar texto"}</button>
              <button className="botao botao-claro botao-mini" onClick={() => window.print()}>Salvar em PDF</button>
            </div>
            <article className="proposta-doc">
              <span className="rotulo">Proposta comercial · {lead.dossie.empresa}</span>
              <h2 className="titulo-medio">{p.titulo}</h2>
              <section className="bloco"><h3>Contexto</h3><p>{p.contexto}</p></section>
              <section className="bloco"><h3>O problema</h3><p>{p.problema}</p></section>
              <section className="bloco"><h3>A solução</h3><p>{p.solucao}</p></section>
              <section className="bloco">
                <h3>Como vamos fazer</h3>
                <div className="etapas">
                  {p.etapas.map((e, i) => (
                    <div key={e.nome} className="etapa">
                      <span className="etapa-num">{i + 1}</span>
                      <div className="etapa-corpo"><b style={{ fontWeight: 500 }}>{e.nome}</b><span className="pequeno texto-suave">{e.descricao}</span></div>
                      <span className="etapa-prazo">{e.prazo}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section className="bloco">
                <h3>Entregáveis</h3>
                <ul className="lista-limpa">{p.entregaveis.map((x) => <li key={x} className="item-ponto">{x}</li>)}</ul>
              </section>
              <section className="bloco"><h3>Investimento</h3><p>{p.investimento}</p></section>
              <section className="bloco">
                <h3>Próximos passos</h3>
                <ul className="lista-limpa">{p.proximos_passos.map((x) => <li key={x} className="item-ponto">{x}</li>)}</ul>
              </section>
            </article>
          </>
        )}
      </div>
    </div>
  );
}
