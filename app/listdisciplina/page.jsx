'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/header";
import styles from "../listaluno/listaluno.module.css";

export default function ListDisciplina() {
    const [disciplinas, setDisciplinas] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
    const router = useRouter();

    useEffect(() => {
        buscarDisciplinas();
    }, []);

    async function buscarDisciplinas() {
        setCarregando(true);
        try {
            const resposta = await fetch("/api/disciplinas", { cache: "no-store" });
            const dados = await resposta.json();
            if (Array.isArray(dados)) {
                setDisciplinas(dados);
            } else {
                setDisciplinas([]);
            }
        } catch (error) {
            console.error("Erro ao carregar disciplinas:", error);
            setMensagem({ tipo: "erro", texto: "Erro ao buscar a lista de disciplinas." });
        } finally {
            setCarregando(false);
        }
    }

    function editarDisciplina(id) {
        router.push(`/editdisciplina/${id}`);
    }

    async function excluirDisciplina(id, nome) {
        if (!confirm(`Deseja realmente excluir a disciplina "${nome}" (ID: ${id})?`)) {
            return;
        }

        try {
            const resposta = await fetch("/api/disciplinas", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id_disciplina: id })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                alert(dados.erro || "Erro ao excluir disciplina.");
                return;
            }

            alert(dados.mensagem || "Disciplina excluída com sucesso!");
            buscarDisciplinas();
        } catch (error) {
            console.error("Erro ao excluir disciplina:", error);
            alert("Erro ao tentar excluir a disciplina.");
        }
    }

    const disciplinasFiltradas = disciplinas.filter((d) =>
        d.nome.toLowerCase().includes(pesquisa.toLowerCase()) ||
        String(d.id_disciplina).includes(pesquisa)
    );

    return (
        <>
            <Header />

            <main className={styles.container}>
                <section className={styles.headerSection}>
                    <h2>Lista de Disciplinas</h2>
                    <p>Consulte, edite ou exclua as disciplinas cadastradas no sistema.</p>
                </section>

                <section className={styles.tableCard}>
                    <div className={styles.actions}>
                        <input
                            type="text"
                            placeholder="Pesquisar por nome ou ID..."
                            className={styles.search}
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                        />

                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div className={styles.total}>
                                Total: {disciplinasFiltradas.length} {disciplinasFiltradas.length === 1 ? "disciplina" : "disciplinas"}
                            </div>

                            <Link
                                href="/caddisciplina"
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    padding: "0.5rem 0.9rem",
                                    borderRadius: "0.6rem",
                                    backgroundColor: "var(--button-background)",
                                    color: "var(--button-text)",
                                    fontSize: "0.88rem",
                                    fontWeight: "600",
                                    textDecoration: "none"
                                }}
                            >
                                + Nova Disciplina
                            </Link>
                        </div>
                    </div>

                    {mensagem.texto && (
                        <div className={`${styles.feedback} ${mensagem.tipo === "erro" ? styles.feedbackError : ""}`}>
                            {mensagem.texto}
                        </div>
                    )}

                    {carregando ? (
                        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                            Carregando disciplinas...
                        </div>
                    ) : disciplinasFiltradas.length === 0 ? (
                        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                            {pesquisa ? "Nenhuma disciplina encontrada para esta busca." : "Nenhuma disciplina cadastrada ainda."}
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: "80px" }}>ID</th>
                                    <th>Nome da Disciplina</th>
                                    <th>Pontuação Mínima</th>
                                    <th style={{ width: "160px", textAlign: "center" }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {disciplinasFiltradas.map((disciplina) => (
                                    <tr key={disciplina.id_disciplina}>
                                        <td><strong>#{disciplina.id_disciplina}</strong></td>
                                        <td>{disciplina.nome}</td>
                                        <td>
                                            <span style={{
                                                padding: "0.25rem 0.6rem",
                                                borderRadius: "0.4rem",
                                                backgroundColor: "var(--accent-soft)",
                                                color: "var(--accent-strong)",
                                                fontWeight: "650",
                                                fontSize: "0.88rem"
                                            }}>
                                                {Number(disciplina.pontuacao_minima).toFixed(1)}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <button
                                                className={styles.actionButton}
                                                onClick={() => editarDisciplina(disciplina.id_disciplina)}
                                                title="Editar disciplina"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                                onClick={() => excluirDisciplina(disciplina.id_disciplina, disciplina.nome)}
                                                title="Excluir disciplina"
                                            >
                                                Excluir
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            </main>
        </>
    );
}

