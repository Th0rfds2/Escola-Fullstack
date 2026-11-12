'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/header";
import styles from "../listaluno/listaluno.module.css";

export default function ListProfessor() {
    const [professores, setProfessores] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
    const router = useRouter();

    useEffect(() => {
        buscarProfessores();
    }, []);

    async function buscarProfessores() {
        setCarregando(true);
        try {
            const resposta = await fetch("/api/professores", { cache: "no-store" });
            const dados = await resposta.json();
            if (Array.isArray(dados)) {
                setProfessores(dados);
            } else {
                setProfessores([]);
            }
        } catch (error) {
            console.error("Erro ao carregar professores:", error);
            setMensagem({ tipo: "erro", texto: "Erro ao buscar a lista de professores." });
        } finally {
            setCarregando(false);
        }
    }

    function editarProfessor(id) {
        router.push(`/editprofessor/${id}`);
    }

    async function excluirProfessor(id, nome) {
        if (!confirm(`Deseja realmente excluir o(a) professor(a) "${nome}" (ID: ${id})?`)) {
            return;
        }

        try {
            const resposta = await fetch("/api/professores", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id_professor: id })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                alert(dados.erro || "Erro ao excluir professor.");
                return;
            }

            alert(dados.mensagem || "Professor excluído com sucesso!");
            buscarProfessores();
        } catch (error) {
            console.error("Erro ao excluir professor:", error);
            alert("Erro ao tentar excluir o professor.");
        }
    }

    const professoresFiltrados = professores.filter((p) => {
        const termo = pesquisa.toLowerCase();
        return (
            p.nome.toLowerCase().includes(termo) ||
            p.nif.toLowerCase().includes(termo) ||
            (p.disciplina_nome && p.disciplina_nome.toLowerCase().includes(termo)) ||
            (p.dias_semana && p.dias_semana.toLowerCase().includes(termo)) ||
            String(p.id_professor).includes(termo)
        );
    });

    return (
        <>
            <Header />

            <main className={styles.container}>
                <section className={styles.headerSection}>
                    <h2>Lista de Professores</h2>
                    <p>Consulte, edite ou exclua os professores e suas respectivas disciplinas atribuídas.</p>
                </section>

                <section className={styles.tableCard}>
                    <div className={styles.actions}>
                        <input
                            type="text"
                            placeholder="Pesquisar por professor, NIF, disciplina ou dia..."
                            className={styles.search}
                            style={{ minWidth: "320px" }}
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                        />

                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div className={styles.total}>
                                Total: {professoresFiltrados.length} {professoresFiltrados.length === 1 ? "professor" : "professores"}
                            </div>

                            <Link
                                href="/cadprofessor"
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
                                + Novo Professor
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
                            Carregando professores...
                        </div>
                    ) : professoresFiltrados.length === 0 ? (
                        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                            {pesquisa ? "Nenhum professor encontrado para esta pesquisa." : "Nenhum professor cadastrado ainda."}
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: "60px" }}>ID</th>
                                    <th>Nome do Professor</th>
                                    <th>Matrícula (NIF)</th>
                                    <th>Disciplina Responsável (FK)</th>
                                    <th>Dias de Aula</th>
                                    <th style={{ textAlign: "center" }}>Aulas / Semana</th>
                                    <th style={{ width: "160px", textAlign: "center" }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {professoresFiltrados.map((prof) => (
                                    <tr key={prof.id_professor}>
                                        <td><strong>#{prof.id_professor}</strong></td>
                                        <td style={{ fontWeight: 650 }}>{prof.nome}</td>
                                        <td>
                                            <span style={{
                                                padding: "0.2rem 0.5rem",
                                                borderRadius: "0.35rem",
                                                background: "var(--surface-muted)",
                                                border: "1px solid var(--border)",
                                                fontSize: "0.85rem",
                                                fontWeight: 600
                                            }}>
                                                {prof.nif}
                                            </span>
                                        </td>
                                        <td>
                                            {prof.disciplina_nome ? (
                                                <span style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "0.3rem",
                                                    padding: "0.25rem 0.6rem",
                                                    borderRadius: "0.4rem",
                                                    backgroundColor: "var(--accent-soft)",
                                                    color: "var(--accent-strong)",
                                                    fontWeight: 650,
                                                    fontSize: "0.88rem"
                                                }}>
                                                    📘 {prof.disciplina_nome} <small style={{ opacity: 0.8 }}>(#{prof.id_disciplina})</small>
                                                </span>
                                            ) : (
                                                <span style={{ color: "var(--text-secondary)" }}>
                                                    ID #{prof.id_disciplina}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}>
                                                {prof.dias_semana}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "center", fontWeight: 700 }}>
                                            {prof.total_aulas_semana} {prof.total_aulas_semana === 1 ? "aula" : "aulas"}
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <button
                                                className={styles.actionButton}
                                                onClick={() => editarProfessor(prof.id_professor)}
                                                title="Editar professor"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                                onClick={() => excluirProfessor(prof.id_professor, prof.nome)}
                                                title="Excluir professor"
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

