'use client';

import { useEffect, useState, use } from "react";
import Header from "../../components/header";
import styles from "./cadaluno.module.css";
import { redirect } from "next/navigation";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

export default function EditAlunoPage({ params: paramsPromise }) {
    const router = useRouter();
    const routeParams = useParams();

    const resolvedParams = paramsPromise ? use(paramsPromise) : null;
    const id = resolvedParams?.id || routeParams?.id;

    const [id_aluno, setIdAluno] = useState("")
    const [nome, setNome] = useState("");
    const [idade, setIdade] = useState("");
    const [serie, setSerie] = useState("");
    const [ra, setRa] = useState("");
    const [carregando, setCarregando] = useState(true);


    useEffect(() => {
        if (id) {
            buscarAluno(id);
        } else {
            setCarregando(false);
        }
    }, [id]);

    async function buscarAluno(idAluno) {
        try {
            setCarregando(true);
            const resposta = await fetch(`/api/alunos/${idAluno}`);

            if (!resposta.ok) {
                alert("Aluno não encontrado!");
                router.push("/listaluno");
                return;
            }

            const dados = await resposta.json();
            setIdAluno(dados.id_aluno || "");
            setNome(dados.nome || "");
            setIdade(dados.idade || "");
            setSerie(dados.serie || "");
            setRa(dados.ra || "");
        } catch (erro) {
            console.error("Erro ao carregar aluno:", erro);
            alert("Erro ao carregar dados do aluno.");
        } finally {
            setCarregando(false);
        }
    }

    async function editarAluno(event) {
        event.preventDefault();

        if (!id) {
            alert("ID do aluno não foi encontrado.");
            return;
        }

        const resposta = await fetch("/api/alunos", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id_aluno,
                nome,
                idade,
                serie,
                ra,
            }),
        });

        const dados = await resposta.json();

        alert(dados.mensagem || dados.erro);

        if (resposta.ok) {
            router.push("/listaluno");
        }
    }

    if (carregando) {
        return (
            <main className="container">
                <h1>Editar Aluno</h1>
                <p>Carregando informações do aluno...</p>
            </main>
        );
    }


    return (
        <>
            <Header />

            <main className={styles.container}>
                <div className={styles.card}>
                    <h2 className={styles.title}>
                        Edição de Alunos
                    </h2>

                    <p className={styles.subtitle}>
                        Preencha os dados do aluno para realizar o cadastro no sistema.
                    </p>

                    <form className={styles.form} onSubmit={editarAluno}>
                        <input type="text" value={id_aluno} onChange={(event) => setIdAluno(event.target.value)} hidden />

                        <div className={styles.inputGroup}>
                            <label htmlFor="nome">Nome</label>
                            <input
                                id="nome"
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Digite o nome do aluno"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="idade">Idade</label>
                            <input
                                id="idade"
                                type="number"
                                value={idade}
                                onChange={(e) => setIdade(e.target.value)}
                                placeholder="Digite a idade"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="serie">Série</label>
                            <input
                                id="serie"
                                type="text"
                                value={serie}
                                onChange={(e) => setSerie(e.target.value)}
                                placeholder="Digite a série"
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="ra">RA</label>
                            <input
                                id="ra"
                                type="number"
                                value={ra}
                                onChange={(e) => setRa(e.target.value)}
                                placeholder="Digite o RA"
                            />
                        </div>

                        <button className={styles.button} type="submit">
                            Editar Aluno
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}