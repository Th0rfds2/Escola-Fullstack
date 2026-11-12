'use client';

import { useState, useEffect } from 'react';
import Header from "../components/header";
import styles from "./listaluno.module.css";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ListAluno() {
    const [alunos, setAlunos] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [carregando, setCarregando] = useState(true);
    const router = useRouter();

    useEffect(() => {
        buscarAlunos();
    }, []);

    async function buscarAlunos() {
        setCarregando(true);
        try {
            const resposta = await fetch('/api/alunos', { cache: 'no-store' });
            const dados = await resposta.json();
            if (Array.isArray(dados)) {
                setAlunos(dados);
            } else {
                setAlunos([]);
            }
        } catch (erro) {
            console.error("Erro ao buscar alunos:", erro);
        } finally {
            setCarregando(false);
        }
    }

    function editarAlunos(id) {
        router.push(`/editaluno/${id}`);
    }

    async function excluirAlunos(idAluno, nome) {
        if (!confirm(`Deseja realmente excluir o aluno "${nome || idAluno}"?`)) {
            return;
        }

        try {
            const resposta = await fetch("/api/alunos", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_aluno: idAluno,
                }),
            });

            const dados = await resposta.json();
            alert(dados.mensagem || dados.erro || "Ação processada.");
            buscarAlunos();
        } catch (erro) {
            console.error("Erro ao excluir aluno:", erro);
            alert("Erro ao excluir o aluno.");
        }
    }

    const alunosFiltrados = alunos.filter((aluno) => {
        const termo = pesquisa.toLowerCase();
        return (
            (aluno.nome && aluno.nome.toLowerCase().includes(termo)) ||
            (aluno.ra && String(aluno.ra).toLowerCase().includes(termo)) ||
            (aluno.serie && String(aluno.serie).toLowerCase().includes(termo)) ||
            String(aluno.id_aluno).includes(termo)
        );
    });

    return (
        <>
            <Header />

            <main className={styles.container}>
                <section className={styles.headerSection}>
                    <h2>Lista de Alunos</h2>
                    <p>Consulte todos os alunos cadastrados no sistema.</p>
                </section>

                <section className={styles.tableCard}>
                    <div className={styles.actions}>
                        <input
                            type="text"
                            placeholder="Pesquisar por nome, RA ou série..."
                            className={styles.search}
                            value={pesquisa}
                            onChange={(e) => setPesquisa(e.target.value)}
                        />

                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            <div className={styles.total}>
                                Total: {alunosFiltrados.length} {alunosFiltrados.length === 1 ? 'aluno' : 'alunos'}
                            </div>

                            <Link
                                href="/cadaluno"
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
                                + Novo Aluno
                            </Link>
                        </div>
                    </div>

                    {carregando ? (
                        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                            Carregando alunos...
                        </div>
                    ) : alunosFiltrados.length === 0 ? (
                        <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                            {pesquisa ? "Nenhum aluno encontrado para esta busca." : "Nenhum aluno cadastrado ainda."}
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ width: "60px" }}>ID</th>
                                    <th>Nome</th>
                                    <th>Idade</th>
                                    <th>Série</th>
                                    <th>RA</th>
                                    <th style={{ width: "160px", textAlign: "center" }}>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {alunosFiltrados.map((aluno) => (
                                    <tr key={aluno.id_aluno}>
                                        <td><strong>#{aluno.id_aluno}</strong></td>
                                        <td style={{ fontWeight: 650 }}>{aluno.nome}</td>
                                        <td>{aluno.idade}</td>
                                        <td>{aluno.serie}</td>
                                        <td>
                                            <span style={{
                                                padding: "0.2rem 0.5rem",
                                                borderRadius: "0.35rem",
                                                background: "var(--surface-muted)",
                                                border: "1px solid var(--border)",
                                                fontSize: "0.85rem",
                                                fontWeight: 600
                                            }}>
                                                {aluno.ra}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "center" }}>
                                            <button
                                                className={styles.actionButton}
                                                onClick={() => editarAlunos(aluno.id_aluno)}
                                                title="Editar aluno"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                                onClick={() => excluirAlunos(aluno.id_aluno, aluno.nome)}
                                                title="Excluir aluno"
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
