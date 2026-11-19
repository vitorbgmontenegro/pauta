"use client";

// Etapa 1: dividida em duas visões para não despejar tudo de uma vez.
//  - Empresa: o que a pesquisa achou (resumo, dores, o que oferecer, o que confirmar)
//  - Roteiro: o que falar na reunião, com as perguntas como checklist
// Detalhes secundários (sinais, fontes, objetivo de cada pergunta) ficam recolhidos.

import { useState } from "react";
import type { Lead } from "@/lib/types";

type Props = { lead: Lead; atualizar: (m: Partial<Lead>) => void };
type Visao = "empresa" | "roteiro";

export default function Preparar({ lead, atualizar }: Props) {
  const [visao, setVisao] = useState<Visao>("empresa");

  return (
    <div className="pilha">
      <div className="alternar">
        <button className={visao === "empresa" ? "atual" : ""} onClick={() => setVisao("empresa")}>Empresa</button>
        <button className={visao === "roteiro" ? "atual" : ""} onClick={() => setVisao("roteiro")}>Roteiro da reunião</button>
      </div>
      {visao === "empresa" ? <Empresa lead={lead} /> : <Roteiro lead={lead} atualizar={atualizar} />}
    </div>
  );
}

/* ---------------- Empresa ---------------- */

function Empresa({ lead }: { lead: Lead }) {
  const d = lead.dossie;
  return (
    <>
      <section className="cartao">
        <h2 className="subtitulo">Resumo</h2>
        <p>{d.resumo}</p>
        <div className="dados pequeno">
          <div><span className="rotulo">Porte</span>{d.porte}</div>
          <div style={{ flex: "1 1 260px" }}><span className="rotulo">Presença digital</span>{d.presenca_digital}</div>
        </div>
      </section>

      <div className="grade">
        <section className="cartao">
          <h2 className="subtitulo">Dores prováveis</h2>
          <ul className="lista">
            {d.dores_provaveis.map((x) => (
              <li key={x.dor}><b>{x.dor}</b><span className="pequeno suave">{x.por_que}</span></li>
            ))}
          </ul>
        </section>

        <section className="cartao">
          <h2 className="subtitulo">O que oferecer</h2>
          <ul className="lista">
            {d.oportunidades.map((o) => (
              <li key={o.titulo}><b>{o.titulo}</b><span className="pequeno suave">{o.descricao}</span></li>
            ))}
          </ul>
        </section>
      </div>

      {d.incertezas.length > 0 && (
        <section className="cartao">
          <h2 className="subtitulo">Confirme na reunião</h2>
          <p className="pequeno suave">A pesquisa não encontrou isso. Pergunte em vez de supor.</p>
          <ul className="lista">{d.incertezas.map((x) => <li key={x}>{x}</li>)}</ul>
        </section>
      )}

      <div className="recolhivel">
        <details>
          <summary>Por que encaixa no ICP ({d.encaixe_icp.nota}/10)</summary>
          <p className="pequeno">{d.encaixe_icp.justificativa}</p>
        </details>
        {d.sinais.length > 0 && (
          <details>
            <summary>Sinais encontrados ({d.sinais.length})</summary>
            <ul className="lista pequeno">{d.sinais.map((s) => <li key={s}>{s}</li>)}</ul>
          </details>
        )}
        {lead.fontes.length > 0 && (
          <details>
            <summary>Fontes da pesquisa ({lead.fontes.length})</summary>
            <ul className="lista pequeno">
              {lead.fontes.slice(0, 10).map((f) => (
                <li key={f.url}><a href={f.url} target="_blank" rel="noreferrer">{f.titulo}</a></li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </>
  );
}

/* ---------------- Roteiro ---------------- */

function Roteiro({ lead, atualizar }: Props) {
  const r = lead.roteiro;
  const feitas = new Set(lead.perguntasFeitas ?? []);
  const [verObjetivos, setVerObjetivos] = useState(false);

  function alternar(i: number) {
    const novo = new Set(feitas);
    if (novo.has(i)) novo.delete(i);
    else novo.add(i);
    atualizar({ perguntasFeitas: [...novo] });
  }

  return (
    <>
      <section className="cartao">
        <h2 className="subtitulo">Abertura</h2>
        <p className="frase">{r.abertura.rapport[0]}</p>
        <p className="frase">{r.abertura.agenda}</p>
        {r.abertura.rapport.length > 1 && (
          <p className="pequeno suave">Outro gancho: {r.abertura.rapport.slice(1).join(" · ")}</p>
        )}
      </section>

      <section className="cartao">
        <div className="cartao-cab">
          <h2 className="subtitulo">Perguntas</h2>
          <div className="linha">
            <span className="pequeno suave">{feitas.size} de {r.perguntas.length}</span>
            <button className="link" onClick={() => setVerObjetivos((v) => !v)}>
              {verObjetivos ? "Esconder objetivos" : "Ver objetivos"}
            </button>
          </div>
        </div>
        <div className="barra"><div style={{ width: `${(feitas.size / Math.max(r.perguntas.length, 1)) * 100}%` }} /></div>
        <div>
          {r.perguntas.map((q, i) => (
            <div
              key={i}
              className={`pergunta ${feitas.has(i) ? "feita" : ""}`}
              onClick={() => alternar(i)}
              role="checkbox"
              aria-checked={feitas.has(i)}
              tabIndex={0}
              onKeyDown={(e) => (e.key === " " || e.key === "Enter") && (e.preventDefault(), alternar(i))}
            >
              <span className="marcador">{feitas.has(i) ? "✓" : ""}</span>
              <div className="pergunta-corpo">
                <span className="tipo">{q.tipo}</span>
                <span className="pergunta-txt">{q.pergunta}</span>
                {verObjetivos && <span className="pequeno suave">{q.objetivo}</span>}
              </div>
            </div>
          ))}
        </div>
        <p className="pequeno suave">Clique na pergunta para marcar como feita durante a reunião.</p>
      </section>

      <div className="grade">
        <section className="cartao">
          <h2 className="subtitulo">Se ouvir isso…</h2>
          <div>
            {r.objecoes.map((o) => (
              <details key={o.objecao}>
                <summary>“{o.objecao}”</summary>
                <p className="pequeno suave">{o.resposta}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="cartao">
          <h2 className="subtitulo">Fechamento</h2>
          <p className="frase">{r.fechamento.frase}</p>
          <p className="pequeno suave">Próximo passo: {r.fechamento.proximo_passo}</p>
        </section>
      </div>
    </>
  );
}
