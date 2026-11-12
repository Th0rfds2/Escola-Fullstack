'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/header";
import styles from "../cadaluno/cadaluno.module.css";

const camposNota = [
    { id: "t1", label: "Trabalho 1 (T1)" },
    { id: "t2", label: "Trabalho 2 (T2)" },
    { id: "n1", label: "Nota 1 (N1)" },
    { id: "n2", label: "Nota 2 (N2)" },
    { id: "n3", label: "Nota 3 (N3)" },
];

export default function CadastroNotas() {
    const router = useRouter();
    const [alunos, setAlunos] = useState([]);
    const [idAluno, setIdAluno] = useState("");
    const [notas, setNotas] = useState({
        t1: "",
        t2: "",
        n1: "",
        n2: "",
        n3: "",
    });
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        async function carregarAlunos() {
            try {
                const [respostaAlunos, respostaNotas] = await Promise.all([
                    fetch("/api/alunos", { cache: "no-store" }),
                    fetch("/api/notas", { cache: "no-store" }),
                ]);

                if (!respostaAlunos.ok || !respostaNotas.ok) {
                    throw new Error("Não foi possível carregar os alunos.");
                }

                const [dadosAlunos, dadosNotas] = await Promise.all([
                    respostaAlunos.json(),
                    respostaNotas.json(),
                ]);
                const idsComNotas = new Set(
                    dadosNotas.map((nota) => Number(nota.id_aluno))
                );
                const alunosDisponiveis = dadosAlunos.filter(
                    (aluno) => !idsComNotas.has(Number(aluno.id_aluno))
                );

                setAlunos(alunosDisponiveis);
            } catch (error) {
                console.error("Erro ao carregar alunos para as notas:", error);
                setMensagem("Erro ao carregar os alunos. Tente novamente.");
            } finally {
                setCarregando(false);
            }
        }

        carregarAlunos();
    }, []);

    async function cadastrarNotas(evento) {
        evento.preventDefault();
        setSalvando(true);
        setMensagem("");

        try {
            const resposta = await fetch("/api/notas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_aluno: Number(idAluno),
                    ...Object.fromEntries(
                        Object.entries(notas).map(([campo, valor]) => [
                            campo,
                            Number(valor),
                        ])
                    ),
                }),
            });
            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.erro || "Erro ao cadastrar as notas.");
            }

            router.push("/listnota");
        } catch (error) {
            console.error("Erro ao cadastrar notas:", error);
            setMensagem(error.message || "Erro ao cadastrar as notas.");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <>
            <Header />
            <main className={styles.container}>
                <div className={styles.card}>
                    <h2 className={styles.title}>Cadastro de Notas</h2>
                    <p className={styles.subtitle}>
                        Selecione um aluno e informe as notas de 0 a 10.
                    </p>

                    {mensagem && <p role="alert">{mensagem}</p>}

                    {carregando ? (
                        <p className={styles.subtitle}>Carregando alunos...</p>
                    ) : alunos.length === 0 ? (
                        <p className={styles.subtitle}>
                            Não há alunos disponíveis para cadastrar notas. Cadastre um aluno ou
                            consulte as notas já lançadas.
                        </p>
                    ) : (
                        <form className={styles.form} onSubmit={cadastrarNotas}>
                            <div className={styles.inputGroup}>
                                <label htmlFor="aluno">Aluno</label>
                                <select
                                    id="aluno"
                                    value={idAluno}
                                    onChange={(evento) => setIdAluno(evento.target.value)}
                                    required
                                >
                                    <option value="">Selecione um aluno</option>
                                    {alunos.map((aluno) => (
                                        <option key={aluno.id_aluno} value={aluno.id_aluno}>
                                            {aluno.nome} (RA: {aluno.ra})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {camposNota.map((campo) => (
                                <div className={styles.inputGroup} key={campo.id}>
                                    <label htmlFor={campo.id}>{campo.label}</label>
                                    <input
                                        id={campo.id}
                                        type="number"
                                        min="0"
                                        max="10"
                                        step="0.1"
                                        value={notas[campo.id]}
                                        onChange={(evento) =>
                                            setNotas((atuais) => ({
                                                ...atuais,
                                                [campo.id]: evento.target.value,
                                            }))
                                        }
                                        placeholder="Digite uma nota de 0 a 10"
                                        required
                                    />
                                </div>
                            ))}

                            <button
                                className={styles.button}
                                type="submit"
                                disabled={salvando}
                            >
                                {salvando ? "Salvando..." : "Cadastrar Notas"}
                            </button>
                        </form>
                    )}
                </div>
            </main>
        </>
    );
}
