'use client';

import { useEffect, useState, use } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/header";
import styles from "../../cadprofessor/cadprofessor.module.css";

const DIAS_DISPONIVEIS = [
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado"
];

export default function EditProfessorPage({ params: paramsPromise }) {
    const router = useRouter();
    const routeParams = useParams();

    const resolvedParams = paramsPromise ? use(paramsPromise) : null;
    const id = resolvedParams?.id || routeParams?.id;

    const [idProfessor, setIdProfessor] = useState("");
    const [nome, setNome] = useState("");
    const [nif, setNif] = useState("");
    const [diasSelecionados, setDiasSelecionados] = useState([]);
    const [idDisciplina, setIdDisciplina] = useState("");
    const [totalAulasSemana, setTotalAulasSemana] = useState("");

    const [disciplinas, setDisciplinas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });

    useEffect(() => {
        async function carregarDados() {
            try {
                setCarregando(true);

                // Carrega tanto disciplinas quanto o professor
                const [respDisciplinas, respProf] = await Promise.all([
                    fetch("/api/disciplinas", { cache: "no-store" }),
                    id ? fetch(`/api/professores/${id}`, { cache: "no-store" }) : Promise.resolve(null)
                ]);

                if (respDisciplinas.ok) {
                    const dadosDisciplinas = await respDisciplinas.json();
                    setDisciplinas(dadosDisciplinas);
                }

                if (respProf) {
                    if (!respProf.ok) {
                        alert("Professor não encontrado!");
                        router.push("/listprofessor");
                        return;
                    }
                    const dadosProf = await respProf.json();
                    setIdProfessor(dadosProf.id_professor || "");
                    setNome(dadosProf.nome || "");
                    setNif(dadosProf.nif || "");
                    setIdDisciplina(String(dadosProf.id_disciplina || ""));
                    setTotalAulasSemana(dadosProf.total_aulas_semana !== undefined ? String(dadosProf.total_aulas_semana) : "");

                    if (dadosProf.dias_semana) {
                        const diasArray = dadosProf.dias_semana.split(",").map((d) => d.trim());
                        setDiasSelecionados(diasArray);
                    }
                }
            } catch (erro) {
                console.error("Erro ao carregar dados do professor:", erro);
                setMensagem({ tipo: "erro", texto: "Erro ao carregar os dados para edição." });
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, [id]);

    function toggleDia(dia) {
        setDiasSelecionados((atuais) => {
            if (atuais.includes(dia)) {
                return atuais.filter((d) => d !== dia);
            } else {
                return [...atuais, dia];
            }
        });
    }

    async function salvarEdicao(event) {
        event.preventDefault();
        setSalvando(true);
        setMensagem({ tipo: "", texto: "" });

        if (!idProfessor) {
            setMensagem({ tipo: "erro", texto: "Identificador do professor não encontrado." });
            setSalvando(false);
            return;
        }

        if (!nome.trim()) {
            setMensagem({ tipo: "erro", texto: "O nome do professor é obrigatório." });
            setSalvando(false);
            return;
        }

        if (!nif.trim()) {
            setMensagem({ tipo: "erro", texto: "A matrícula (NIF) é obrigatória." });
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
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_professor: Number(idProfessor),
                    nome: nome.trim(),
                    nif: nif.trim(),
                    dias_semana: diasSelecionados.join(", "),
                    id_disciplina: Number(idDisciplina),
                    total_aulas_semana: Number(totalAulasSemana),
                }),
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.erro || "Erro ao atualizar professor.");
            }

            alert(dados.mensagem || "Professor atualizado com sucesso!");
            router.push("/listprofessor");
        } catch (erro) {
            console.error("Erro ao salvar edição do professor:", erro);
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
                        <h2 className={styles.title}>Editar Professor</h2>
                        <p className={styles.subtitle}>Carregando informações do professor...</p>
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
                        Editar Professor
                    </h2>

                    <p className={styles.subtitle}>
                        Atualize os dados e a disciplina atribuída ao professor #{idProfessor}.
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
                            <label htmlFor="id_professor">Identificador Único (ID)</label>
                            <input
                                id="id_professor"
                                type="text"
                                value={`ID #${idProfessor}`}
                                disabled
                                style={{ opacity: 0.7, cursor: "not-allowed" }}
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="nome">Nome do Professor *</label>
                            <input
                                id="nome"
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Digite o nome do professor"
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
                                placeholder="Digite o NIF"
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
                                placeholder="Digite o total de aulas"
                                required
                            />
                        </div>

                        <button className={styles.button} type="submit" disabled={salvando}>
                            {salvando ? "Salvando..." : "Salvar Alterações"}
                        </button>

                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                            <Link href="/listprofessor" style={{
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

