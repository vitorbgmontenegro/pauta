"use client";

// Etapa 3: anotações da reunião (real ou do ensaio) viram uma proposta comercial.
// A proposta aparece como documento e pode ser copiada ou salva em PDF pela impressão do navegador.

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
      const proposta = await postar<Proposta>("/api/proposta", { lead: { entrada: lead.entrada, dossie: lead.dossie }, anotacoes });
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
    <div className="proposta">
      <section className="cartao nao-imprimir">
        <h2 className="subtitulo">Anotações da reunião</h2>
        <p className="pequeno suave">O que o cliente falou: problemas, números, prazos e quem decide.</p>
        <div className="campo">
          <textarea value={anotacoes} onChange={(e) => setAnotacoes(e.target.value)} placeholder="Ex.: perde uns 2 pedidos por dia no WhatsApp…" />
        </div>
        {erro && <div className="erro">{erro}</div>}
        <button className="botao" onClick={gerar} disabled={gerando || anotacoes.trim().length < 20}>
          {gerando ? "Escrevendo…" : p ? "Gerar de novo" : "Gerar proposta"}
        </button>
      </section>

      {p ? (
        <article className="cartao doc">
          <div className="cartao-cab nao-imprimir">
            <span className="rotulo">Proposta para {lead.dossie.empresa}</span>
            <div className="linha">
              <button className="botao botao-sec botao-mini" onClick={copiar}>{copiado ? "Copiado ✓" : "Copiar"}</button>
              <button className="botao botao-sec botao-mini" onClick={() => window.print()}>PDF</button>
            </div>
          </div>
          <h2 className="titulo" style={{ fontSize: 24 }}>{p.titulo}</h2>
          <section><h3>Contexto</h3><p>{p.contexto}</p></section>
          <section><h3>O problema</h3><p>{p.problema}</p></section>
          <section><h3>A solução</h3><p>{p.solucao}</p></section>
          <section>
            <h3>Etapas</h3>
            <ol>
              {p.etapas.map((e) => (
                <li key={e.nome}>
                  <div className="doc-etapa"><b>{e.nome}</b><span className="pequeno suave">{e.prazo}</span></div>
                  <span className="pequeno suave">{e.descricao}</span>
                </li>
              ))}
            </ol>
          </section>
          <section><h3>Entregáveis</h3><ul>{p.entregaveis.map((x) => <li key={x}>{x}</li>)}</ul></section>
          <section><h3>Investimento</h3><p>{p.investimento}</p></section>
          <section><h3>Próximos passos</h3><ul>{p.proximos_passos.map((x) => <li key={x}>{x}</li>)}</ul></section>
        </article>
      ) : (
        <section className="cartao doc" style={{ alignItems: "center", justifyContent: "center", minHeight: 300, textAlign: "center" }}>
          <span className="suave">{gerando ? "Escrevendo com as palavras do cliente…" : "A proposta aparece aqui."}</span>
        </section>
      )}
    </div>
  );
}
