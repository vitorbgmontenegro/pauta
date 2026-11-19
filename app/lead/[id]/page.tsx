"use client";

// Página de um lead: cabeçalho e as três etapas (Preparar, Ensaiar, Propor).
// O lead mora no localStorage; cada etapa recebe o lead e uma função para atualizá-lo.

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Ensaiar from "@/components/Ensaiar";
import Preparar from "@/components/Preparar";
import Propor from "@/components/Propor";
import { apagarLead, buscarLead, salvarLead } from "@/lib/storage";
import type { Lead } from "@/lib/types";

type Aba = "preparar" | "ensaiar" | "propor";

const ABAS: { id: Aba; nome: string }[] = [
  { id: "preparar", nome: "Preparar" },
  { id: "ensaiar", nome: "Ensaiar" },
  { id: "propor", nome: "Propor" },
];

export default function PaginaLead() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null | undefined>(undefined);
  const [aba, setAba] = useState<Aba>("preparar");

  useEffect(() => {
    setLead(buscarLead(id) ?? null);
  }, [id]);

  /** Atualiza o lead na tela e no armazenamento ao mesmo tempo. */
  function atualizar(mudanca: Partial<Lead>) {
    setLead((atual) => {
      if (!atual) return atual;
      const novo = { ...atual, ...mudanca };
      salvarLead(novo);
      return novo;
    });
  }

  if (lead === undefined) return <p className="suave">Abrindo…</p>;
  if (lead === null)
    return (
      <div className="cartao">
        <h1 className="subtitulo">Reunião não encontrada</h1>
        <p className="suave">As reuniões ficam salvas no navegador onde foram criadas.</p>
        <Link className="botao" href="/" style={{ alignSelf: "flex-start" }}>Voltar</Link>
      </div>
    );

  const d = lead.dossie;
  const nota = d.encaixe_icp.nota;
  return (
    <>
      <div className="cabeca">
        <div className="cabeca-txt">
          <Link href="/" className="voltar">← Suas reuniões</Link>
          <h1 className="titulo">{d.empresa}</h1>
          <span className="suave">{[d.segmento, d.localizacao].filter(Boolean).join(" · ")}</span>
        </div>
        <div className="linha">
          <span className={`selo ${nota >= 7 ? "selo-bom" : ""}`} title={d.encaixe_icp.justificativa}>Encaixe {nota}/10</span>
          {lead.exemplo && <span className="selo">Exemplo fictício</span>}
        </div>
      </div>

      <div className="linha" style={{ justifyContent: "space-between" }}>
        <nav className="etapas">
          {ABAS.map((a, i) => (
            <button key={a.id} className={`etapa ${aba === a.id ? "atual" : ""}`} onClick={() => setAba(a.id)}>
              <b>{i + 1}</b>{a.nome}
            </button>
          ))}
        </nav>
        {!lead.exemplo && (
          <button
            className="link"
            onClick={() => {
              if (confirm("Apagar esta reunião?")) {
                apagarLead(lead.id);
                router.push("/");
              }
            }}
          >
            Apagar
          </button>
        )}
      </div>

      {aba === "preparar" && <Preparar lead={lead} atualizar={atualizar} />}
      {aba === "ensaiar" && <Ensaiar lead={lead} atualizar={atualizar} irPara={() => setAba("propor")} />}
      {aba === "propor" && <Propor lead={lead} atualizar={atualizar} />}
    </>
  );
}
