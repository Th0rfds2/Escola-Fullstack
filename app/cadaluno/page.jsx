'use client';

import { useState } from "react";
import Header from "../components/header";
import styles from "./cadaluno.module.css";
import { useRouter } from "next/navigation";

export default function CadAluno() {
    const router = useRouter();
    const [nome, setNome] = useState('');
    const [idade, setIdade] = useState('');
    const [serie, setSerie] = useState('');
    const [ra, setRa] = useState('');


    async function cadastrarAluno(evento) {
        evento.preventDefault();
        const resposta = await fetch("/api/alunos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome,
                idade,
                serie,
                ra
            })
        })
        const dados = await resposta.json();
        alert(dados.mensagem || dados.erro);
        if (resposta.ok) {
            router.push("/listaluno");
        }
    }

    return (
        <>
            <Header />

            <main className={styles.container}>
                <div className={styles.card}>
                    <h2 className={styles.title}>
                        Cadastro de Alunos
                    </h2>

                    <p className={styles.subtitle}>
                        Preencha os dados do aluno para realizar o cadastro no sistema.
                    </p>

                    <form className={styles.form} onSubmit={cadastrarAluno}>
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
                            Cadastrar Aluno
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}