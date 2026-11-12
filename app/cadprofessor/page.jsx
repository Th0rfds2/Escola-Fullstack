'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../components/header";
import styles from "./cadprofessor.module.css";

const DIAS_DISPONIVEIS = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado"
];

export default function CadProfessor() {
    const router = useRouter();

    const [nome, setNome] = useState("");
    const [nif, setNif] = useState("");
    const [diasSelecionados, setDiasSelecionados] = useState([]);
    const [idDisciplina, setIdDisciplina] = useState("");
    const [totalAulasSemana, setTotalAulasSemana] = useState("");

    const [disciplinas, setDisciplinas] = useState([]);
    const [carregandoDisciplinas, setCarregandoDisciplinas] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

    useEffect(() => {
        async function carregarDisciplinas() {
            try {
                const resposta = await fetch("/api/disciplinas", { cache: "no-store" });
                const dados = await resposta.json();
                if (Array.isArray(dados)) {
                    setDisciplinas(dados);
                    if (dados.length > 0) {
                        setIdDisciplina(String(dados[0].id_disciplina));
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar disciplinas:", error);
                setMensagem({ tipo: "erro", texto: "Não foi possível carregar a lista de disciplinas." });
            } finally {
                setCarregandoDisciplinas(false);
            }
        }

        carregarDisciplinas();
    }, []);

    function toggleDia(dia) {
        setDiasSelecionados((atuais) => {
            if (atuais.includes(dia)) {
                return atuais.filter((d) => d !== dia);
            } else {
                return [...atuais, dia];
            }
        });
    }

    async function cadastrarProfessor(evento) {
        evento.preventDefault();
        setSalvando(true);
        setMensagem({ tipo: "", texto: "" });

        if (!nome.trim()) {
            setMensagem({ tipo: "erro", texto: "Por favor, informe o nome do professor." });
            setSalvando(false);
            return;
        }

        if (!nif.trim()) {
            setMensagem({ tipo: "erro", texto: "Por favor, informe a Matrícula (NIF)." });
            setSalvando(false);
            return;
        }

        if (diasSelecionados.length === 0) {
            setMensagem({ tipo: "erro", texto: "Selecione ao menos um dia em que o professor ministra aula." });
            setSalvando(false);
            return;
        }

        if (!idDisciplina) {
            setMensagem({ tipo: "erro", texto: "Selecione a disciplina responsável." });
            setSalvando(false);
            return;
        }

        if (!totalAulasSemana || Number(totalAulasSemana) < 1) {
            setMensagem({ tipo: "erro", texto: "Informe um total de aulas semanais válido (mínimo 1)." });
            setSalvando(false);
            return;
        }

        try {
            const resposta = await fetch("/api/professores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome: nome.trim(),
                    nif: nif.trim(),
                    dias_semana: diasSelecionados.join(", "),
                    id_disciplina: Number(idDisciplina),
                    total_aulas_semana: Number(totalAulasSemana)
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.erro || "Erro ao cadastrar professor.");
            }

            alert(dados.mensagem || "Professor cadastrado com sucesso!");
            router.push("/listprofessor");
        } catch (error) {
            console.error("Erro ao cadastrar professor:", error);
            setMensagem({ tipo: "erro", texto: error.message || "Erro de conexão ao cadastrar professor." });
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
                        Cadastro de Professores
                    </h2>

                    <p className={styles.subtitle}>
                        Preencha as informações do professor, vincule a disciplina responsável e defina os dias de aula.
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

                    {!carregandoDisciplinas && disciplinas.length === 0 && (
                        <div className={styles.warningBanner} style={{ marginBottom: "1.5rem" }}>
                            ⚠️ <strong>Atenção:</strong> Nenhuma disciplina cadastrada ainda no sistema.
                            Como a disciplina é um campo obrigatório (chave estrangeira), você deve{" "}
                            <Link href="/caddisciplina" style={{ textDecoration: "underline", fontWeight: 700 }}>
                                cadastrar uma disciplina primeiro
                            </Link>{" "}
                            antes de registrar um professor.
                        </div>
                    )}

                    <form className={styles.form} onSubmit={cadastrarProfessor}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="nome">Nome do Professor *</label>
                            <input
                                id="nome"
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Ex: Profa. Maria Silva"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="nif">Matrícula (NIF) *</label>
                            <input
                                id="nif"
                                type="text"
                                value={nif}
                                onChange={(e) => setNif(e.target.value)}
                                placeholder="Ex: NIF 987456"
                                required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label>Dias que Ministra Aula *</label>
                            <div className={styles.daysGrid}>
                                {DIAS_DISPONIVEIS.map((dia) => {
                                    const ativo = diasSelecionados.includes(dia);
                                    return (
                                        <label
                                            key={dia}
                                            className={`${styles.dayOption} ${ativo ? styles.dayOptionActive : ""}`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={ativo}
                                                onChange={() => toggleDia(dia)}
                                            />
                                            {dia}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="id_disciplina">Disciplina que é Responsável (FK) *</label>
                            {carregandoDisciplinas ? (
                                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Carregando disciplinas...</p>
                            ) : disciplinas.length === 0 ? (
                                <p style={{ fontSize: "0.9rem", color: "#c62828" }}>
                                    Nenhuma disciplina disponível. <Link href="/caddisciplina" style={{ textDecoration: "underline" }}>Clique aqui para cadastrar</Link>.
                                </p>
                            ) : (
                                <select
                                    id="id_disciplina"
                                    value={idDisciplina}
                                    onChange={(e) => setIdDisciplina(e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Selecione uma disciplina...</option>
                                    {disciplinas.map((disc) => (
                                        <option key={disc.id_disciplina} value={disc.id_disciplina}>
                                            {disc.nome} (ID #{disc.id_disciplina} • Mínimo: {Number(disc.pontuacao_minima).toFixed(1)} pts)
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="total_aulas_semana">Total de Aulas na Semana *</label>
                            <input
                                id="total_aulas_semana"
                                type="number"
                                min="1"
                                max="100"
                                value={totalAulasSemana}
                                onChange={(e) => setTotalAulasSemana(e.target.value)}
                                placeholder="Ex: 16 aulas por semana"
                                required
                            />
                        </div>

                        <button
                            className={styles.button}
                            type="submit"
                            disabled={salvando || disciplinas.length === 0}
                        >
                            {salvando ? "Salvando..." : "Cadastrar Professor"}
                        </button>

                        <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
                            <Link href="/listprofessor" style={{
                                color: "var(--accent-strong)",
                                textDecoration: "underline",
                                fontSize: "0.9rem"
                            }}>
                                Ver lista de professores cadastrados →
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}

