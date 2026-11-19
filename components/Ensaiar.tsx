"use client";

// Etapa 2: ensaio com cliente simulado.
// À esquerda, o chat. À direita, só o que ajuda agora: sugestões de pergunta e o botão de avaliar.
// Depois da avaliação, o painel da direita vira o resultado.

import { useEffect, useRef, useState } from "react";
import { postar } from "@/lib/api";
import type { Avaliacao, Lead, Mensagem } from "@/lib/types";

type Props = { lead: Lead; atualizar: (m: Partial<Lead>) => void; irPara: () => void };

export default function Ensaiar({ lead, atualizar, irPara }: Props) {
  const mensagens = lead.ensaio?.mensagens ?? [];
  const avaliacao = lead.ensaio?.avaliacao;
  const p = lead.persona;

  const [texto, setTexto] = useState("");
  const [esperando, setEsperando] = useState(false);
  const [avaliando, setAvaliando] = useState(false);
  const [erro, setErro] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [mensagens.length, esperando]);

  function gravar(novas: Mensagem[], av?: Avaliacao) {
    atualizar({ ensaio: { mensagens: novas, avaliacao: av } });
  }

  async function enviar(fala: string) {
    const limpa = fala.trim();
    if (!limpa || esperando) return;
    const novas: Mensagem[] = [...mensagens, { autor: "vendedor", texto: limpa }];
    gravar(novas); // nova fala invalida avaliação anterior
    setTexto("");
    setErro("");
    setEsperando(true);
    try {
      const r = await postar<{ texto: string }>("/api/ensaio", {
        lead: { entrada: lead.entrada, dossie: lead.dossie, persona: lead.persona },
        mensagens: novas,
      });
      gravar([...novas, { autor: "cliente", texto: r.texto }]);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro no ensaio.");
    } finally {
      setEsperando(false);
    }
  }

  async function avaliar() {
    setErro("");
    setAvaliando(true);
    try {
      const av = await postar<Avaliacao>("/api/ensaio/avaliar", {
        lead: { dossie: lead.dossie, roteiro: lead.roteiro, persona: lead.persona },
        mensagens,
      });
      gravar(mensagens, av);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro na avaliação.");
    } finally {
      setAvaliando(false);
    }
  }

  /** Leva o que o cliente falou no ensaio para a etapa de proposta. */
  function usarNaProposta() {
    const falas = mensagens.filter((m) => m.autor === "cliente").map((m) => `- ${m.texto}`).join("\n");
    atualizar({ anotacoes: `O que o cliente falou no ensaio:\n${falas}` });
    irPara();
  }

  // Sugestões: abertura no começo, depois as 3 próximas perguntas ainda não feitas.
  const feitas = new Set(mensagens.filter((m) => m.autor === "vendedor").map((m) => m.texto));
  const sugestoes =
    mensagens.length === 0
      ? [`${lead.roteiro.abertura.rapport[0] ?? ""} ${lead.roteiro.abertura.agenda}`.trim()]
      : lead.roteiro.perguntas.map((q) => q.pergunta).filter((q) => !feitas.has(q)).slice(0, 3);

  return (
    <div className="ensaio">
      <div className="cartao chat">
        <div className="chat-cab">
          <div>
            <div style={{ fontWeight: 600 }}>{p.nome}</div>
            <div className="pequeno suave">{p.cargo}</div>
          </div>
          {mensagens.length > 0 && <button className="link" onClick={() => gravar([])} disabled={esperando}>Recomeçar</button>}
        </div>

        <div className="chat-msgs">
          {mensagens.length === 0 && (
            <div className="chat-vazio">
              <span style={{ fontWeight: 600, color: "var(--texto)" }}>Treine antes da reunião</span>
              <span className="pequeno">{p.nome} só conta os problemas se você perguntar bem.</span>
            </div>
          )}
          {mensagens.map((m, i) => (
            <div key={i} className={`msg msg-${m.autor}`}>{m.texto}</div>
          ))}
          {esperando && <div className="msg msg-cliente suave">digitando…</div>}
          <div ref={fimRef} />
        </div>

        {erro && <div className="erro" style={{ margin: "0 12px 12px" }}>{erro}</div>}

        <form className="chat-form" onSubmit={(e) => { e.preventDefault(); enviar(texto); }}>
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva sua fala…" disabled={esperando} />
          <button className="botao" type="submit" disabled={esperando || !texto.trim()}>Enviar</button>
        </form>
      </div>

      <div className="pilha lado">
        {!avaliacao ? (
          <section className="cartao">
            <h2 className="subtitulo">Sugestões</h2>
            <div className="pilha" style={{ gap: 8 }}>
              {sugestoes.map((s) => (
                <button key={s} className="sugestao" onClick={() => setTexto(s)}>{s}</button>
              ))}
            </div>
            <button className="botao" onClick={avaliar} disabled={avaliando || mensagens.length < 4}>
              {avaliando ? "Avaliando…" : "Encerrar e avaliar"}
            </button>
            {mensagens.length < 4 && <span className="pequeno suave">Troque pelo menos duas falas para avaliar.</span>}
          </section>
        ) : (
          <Resultado avaliacao={avaliacao} onContinuar={() => gravar(mensagens)} onRecomecar={() => gravar([])} onProposta={usarNaProposta} />
        )}
      </div>
    </div>
  );
}

/* ---------------- Resultado da avaliação ---------------- */

type ResultadoProps = { avaliacao: Avaliacao; onContinuar: () => void; onRecomecar: () => void; onProposta: () => void };

function Resultado({ avaliacao: a, onContinuar, onRecomecar, onProposta }: ResultadoProps) {
  return (
    <section className="cartao">
      <div className="linha" style={{ alignItems: "baseline" }}>
        <span className="nota">{a.nota}</span>
        <span className="suave">de 10</span>
      </div>
      <p className="pequeno">{a.resumo}</p>

      <div className="duas">
        <div className="achou">
          <b>Você descobriu</b>
          {a.dores_descobertas.length ? a.dores_descobertas.map((x) => <span key={x}>{x}</span>) : <span>nenhuma dor</span>}
        </div>
        <div className="escondida">
          <b>Ficou escondido</b>
          {a.dores_nao_descobertas.length ? a.dores_nao_descobertas.map((x) => <span key={x}>{x}</span>) : <span>nada</span>}
        </div>
      </div>

      <div>
        <details open>
          <summary>Na próxima, pergunte</summary>
          <ul className="lista pequeno">{a.proxima_vez.map((x) => <li key={x}>{x}</li>)}</ul>
        </details>
        <details>
          <summary>O que faltou</summary>
          <ul className="lista pequeno">{a.faltou.map((x) => <li key={x}>{x}</li>)}</ul>
        </details>
        <details>
          <summary>Pontos fortes</summary>
          <ul className="lista pequeno">{a.pontos_fortes.map((x) => <li key={x}>{x}</li>)}</ul>
        </details>
      </div>

      <button className="botao" onClick={onProposta}>Levar para a proposta →</button>
      <div className="linha">
        <button className="link" onClick={onContinuar}>Continuar conversa</button>
        <button className="link" onClick={onRecomecar}>Ensaiar de novo</button>
      </div>
    </section>
  );
}
