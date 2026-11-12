'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/header";
import styles from "../cadaluno/cadaluno.module.css";

export default function CadDisciplina() {
    const router = useRouter();
    const [nome, setNome] = useState("");
    const [pontuacaoMinima, setPontuacaoMinima] = useState("6.0");
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

    async function cadastrarDisciplina(evento) {
        evento.preventDefault();
        setSalvando(true);
        setMensagem({ tipo: "", texto: "" });

        if (!nome.trim()) {
            setMensagem({ tipo: "erro", texto: "Por favor, digite o nome da disciplina." });
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
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome: nome.trim(),
                    pontuacao_minima: Number(pontuacaoMinima)
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.erro || "Erro ao cadastrar disciplina.");
            }

            alert(dados.mensagem || "Disciplina cadastrada com sucesso!");
            router.push("/listdisciplina");
        } catch (error) {
            console.error("Erro ao cadastrar disciplina:", error);
            setMensagem({ tipo: "erro", texto: error.message || "Erro de conexão ao cadastrar disciplina." });
        } finally {
            setSalvando(false);
        }
    }

    return (
        <>
            <Header />

            <main className={styles.container}>
                <div className={styles.card}>
                    <h2 className={styles.title}>
                        Cadastro de Disciplinas
                    </h2>

                    <p className={styles.subtitle}>
                        Preencha os dados da disciplina e a pontuação mínima para aprovação.
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

                    <form className={styles.form} onSubmit={cadastrarDisciplina}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="nome">Nome da Disciplina *</label>
                            <input
                                id="nome"
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Ex: Matemática, Física, Português..."
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="pontuacao_minima">Pontuação Mínima para Passar (Média) *</label>
                            <input
                                id="pontuacao_minima"
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={pontuacaoMinima}
                                onChange={(e) => setPontuacaoMinima(e.target.value)}
                                placeholder="Ex: 6.0 ou 7.0"
                                required
                            />
                        </div>

                        <button className={styles.button} type="submit" disabled={salvando}>
                            {salvando ? "Salvando..." : "Cadastrar Disciplina"}
                        </button>

                        <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
                            <Link href="/listdisciplina" style={{
                                color: "var(--accent-strong)",
                                textDecoration: "underline",
                                fontSize: "0.9rem"
                            }}>
                                Ver lista de disciplinas cadastradas →
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}

