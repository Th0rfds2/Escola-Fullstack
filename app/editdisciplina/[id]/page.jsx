'use client';

import { useEffect, useState, use } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/header";
import styles from "../../cadaluno/cadaluno.module.css";

export default function EditDisciplinaPage({ params: paramsPromise }) {
    const router = useRouter();
    const routeParams = useParams();

    const resolvedParams = paramsPromise ? use(paramsPromise) : null;
    const id = resolvedParams?.id || routeParams?.id;

    const [idDisciplina, setIdDisciplina] = useState("");
    const [nome, setNome] = useState("");
    const [pontuacaoMinima, setPontuacaoMinima] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

    useEffect(() => {
        if (id) {
            buscarDisciplina(id);
        } else {
            setCarregando(false);
        }
    }, [id]);

    async function buscarDisciplina(idBusca) {
        try {
            setCarregando(true);
            const resposta = await fetch(`/api/disciplinas/${idBusca}`, { cache: "no-store" });

            if (!resposta.ok) {
                alert("Disciplina não encontrada!");
                router.push("/listdisciplina");
                return;
            }

            const dados = await resposta.json();
            setIdDisciplina(dados.id_disciplina || "");
            setNome(dados.nome || "");
            setPontuacaoMinima(dados.pontuacao_minima !== undefined ? String(dados.pontuacao_minima) : "");
        } catch (erro) {
            console.error("Erro ao carregar disciplina:", erro);
            setMensagem({ tipo: "erro", texto: "Erro ao carregar os dados da disciplina." });
        } finally {
            setCarregando(false);
        }
    }

    async function salvarEdicao(event) {
        event.preventDefault();
        setSalvando(true);
        setMensagem({ tipo: "", texto: "" });

        if (!idDisciplina) {
            setMensagem({ tipo: "erro", texto: "Identificador da disciplina ausente." });
            setSalvando(false);
            return;
        }

        if (!nome.trim()) {
            setMensagem({ tipo: "erro", texto: "O nome da disciplina é obrigatório." });
            setSalvando(false);
            return;
        }

        if (pontuacaoMinima === "" || isNaN(Number(pontuacaoMinima))) {
            setMensagem({ tipo: "erro", texto: "Informe uma pontuação mínima válida." });
            setSalvando(false);
            return;
        }

        try {
            const resposta = await fetch("/api/disciplinas", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_disciplina: Number(idDisciplina),
                    nome: nome.trim(),
                    pontuacao_minima: Number(pontuacaoMinima),
                }),
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.erro || "Erro ao atualizar a disciplina.");
            }

            alert(dados.mensagem || "Disciplina atualizada com sucesso!");
            router.push("/listdisciplina");
        } catch (erro) {
            console.error("Erro ao editar disciplina:", erro);
            setMensagem({ tipo: "erro", texto: erro.message || "Erro ao salvar alterações." });
        } finally {
            setSalvando(false);
        }
    }

    if (carregando) {
        return (
            <>
                <Header />
                <main className={styles.container}>
                    <div className={styles.card}>
                        <h2 className={styles.title}>Editar Disciplina</h2>
                        <p className={styles.subtitle}>Carregando informações da disciplina...</p>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <Header />

            <main className={styles.container}>
                <div className={styles.card}>
                    <h2 className={styles.title}>
                        Editar Disciplina
                    </h2>

                    <p className={styles.subtitle}>
                        Atualize os dados da disciplina #{idDisciplina}.
                    </p>

                    {mensagem.texto && (
                        <div style={{
                            padding: "0.75rem 1rem",
                            marginBottom: "1.25rem",
                            borderRadius: "0.5rem",
                            backgroundColor: mensagem.tipo === "erro" ? "#ffebee" : "#e8f5e9",
                            color: mensagem.tipo === "erro" ? "#c62828" : "#2e7d32",
                            border: `1px solid ${mensagem.tipo === "erro" ? "#ef9a9a" : "#a5d6a7"}`,
                            fontSize: "0.95rem"
                        }}>
                            {mensagem.texto}
                        </div>
                    )}

                    <form className={styles.form} onSubmit={salvarEdicao}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="id_disciplina">Identificador Único (ID)</label>
                            <input
                                id="id_disciplina"
                                type="text"
                                value={`ID #${idDisciplina}`}
                                disabled
                                style={{ opacity: 0.7, cursor: "not-allowed" }}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="nome">Nome da Disciplina *</label>
                            <input
                                id="nome"
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Digite o nome da disciplina"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="pontuacao_minima">Pontuação Mínima para Passar *</label>
                            <input
                                id="pontuacao_minima"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={pontuacaoMinima}
                                onChange={(e) => setPontuacaoMinima(e.target.value)}
                                placeholder="Digite a pontuação mínima"
                                required
                            />
                        </div>

                        <button className={styles.button} type="submit" disabled={salvando}>
                            {salvando ? "Salvando..." : "Salvar Alterações"}
                        </button>

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                            <Link href="/listdisciplina" style={{
                                color: "var(--text-secondary)",
                                textDecoration: "none",
                                fontSize: "0.9rem"
                            }}>
                                ← Cancelar e voltar para lista
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}

