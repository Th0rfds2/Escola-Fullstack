'use client';

import { useEffect, useState } from "react";
import Header from "../components/header";
import styles from "../listaluno/listaluno.module.css";

const camposNota = [
    { id: "t1", label: "T1" },
    { id: "t2", label: "T2" },
    { id: "n1", label: "N1" },
    { id: "n2", label: "N2" },
    { id: "n3", label: "N3" },
];

export default function ListaNotas() {
    const [notas, setNotas] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [notaEditando, setNotaEditando] = useState(null);
    const [valoresEdicao, setValoresEdicao] = useState({});
    const [acaoEmAndamento, setAcaoEmAndamento] = useState(false);
    const [mensagem, setMensagem] = useState("");
    const [mensagemErro, setMensagemErro] = useState(false);

    useEffect(() => {
        async function buscarNotas() {
            try {
                const resposta = await fetch("/api/notas", { cache: "no-store" });
                const dados = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(dados.erro || "Erro ao buscar as notas.");
                }

                setNotas(dados);
            } catch (error) {
                console.error("Erro ao carregar notas:", error);
                setErro(error.message || "Erro ao carregar as notas.");
            } finally {
                setCarregando(false);
            }
        }

        buscarNotas();
    }, []);

    function iniciarEdicao(nota) {
        setNotaEditando(nota.id_nota);
        setValoresEdicao(
            Object.fromEntries(
                camposNota.map((campo) => [campo.id, String(nota[campo.id])])
            )
        );
        setMensagem("");
    }

    function cancelarEdicao() {
        setNotaEditando(null);
        setValoresEdicao({});
    }

    async function salvarEdicao(evento) {
        evento.preventDefault();
        setAcaoEmAndamento(true);
        setMensagem("");
        setMensagemErro(false);

        try {
            const resposta = await fetch("/api/notas", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_nota: notaEditando,
                    ...Object.fromEntries(
                        camposNota.map((campo) => [
                            campo.id,
                            Number(valoresEdicao[campo.id]),
                        ])
                    ),
                }),
            });
            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.erro || "Erro ao atualizar as notas.");
            }

            setNotas((atuais) =>
                atuais.map((nota) =>
                    nota.id_nota === notaEditando
                        ? { ...nota, ...Object.fromEntries(
                            camposNota.map((campo) => [
                                campo.id,
                                Number(valoresEdicao[campo.id]),
                            ])
                        ) }
                        : nota
                )
            );
            setNotaEditando(null);
            setValoresEdicao({});
            setMensagem(dados.mensagem);
        } catch (error) {
            console.error("Erro ao atualizar notas:", error);
            setMensagem(error.message || "Erro ao atualizar as notas.");
            setMensagemErro(true);
        } finally {
            setAcaoEmAndamento(false);
        }
    }

    async function excluirNota(idNota) {
        if (!confirm("Deseja realmente excluir as notas deste aluno?")) {
            return;
        }

        setAcaoEmAndamento(true);
        setMensagem("");
        setMensagemErro(false);

        try {
            const resposta = await fetch("/api/notas", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_nota: idNota }),
            });
            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.erro || "Erro ao excluir as notas.");
            }

            setNotas((atuais) =>
                atuais.filter((nota) => nota.id_nota !== idNota)
            );
            setMensagem(dados.mensagem);
        } catch (error) {
            console.error("Erro ao excluir notas:", error);
            setMensagem(error.message || "Erro ao excluir as notas.");
            setMensagemErro(true);
        } finally {
            setAcaoEmAndamento(false);
        }
    }

    return (
        <>
            <Header />
            <main className={styles.container}>
                <section className={styles.headerSection}>
                    <h2>Lista de Notas</h2>
                    <p>Consulte as notas cadastradas por aluno.</p>
                </section>

                <section className={styles.tableCard}>
                    <div className={styles.actions}>
                        <div className={styles.total}>
                            Total: {notas.length} {notas.length === 1 ? "aluno" : "alunos"}
                        </div>
                    </div>
                    {mensagem && (
                        <p
                            className={`${styles.feedback} ${mensagemErro ? styles.feedbackError : ""}`}
                            role={mensagemErro ? "alert" : "status"}
                        >
                            {mensagem}
                        </p>
                    )}

                    {erro ? (
                        <p role="alert">{erro}</p>
                    ) : carregando ? (
                        <p className={styles.total}>Carregando notas...</p>
                    ) : notas.length === 0 ? (
                        <p className={styles.total}>Nenhuma nota cadastrada.</p>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Aluno</th>
                                    <th>RA</th>
                                    {camposNota.map((campo) => (
                                        <th key={campo.id}>{campo.label}</th>
                                    ))}
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notas.map((nota) => (
                                    <tr key={nota.id_nota}>
                                        <td>{nota.nome}</td>
                                        <td>{nota.ra}</td>
                                        {camposNota.map((campo) => (
                                            <td key={campo.id}>
                                                {nota.id_nota === notaEditando ? (
                                                    <input
                                                        className={styles.editInput}
                                                        aria-label={`${campo.label} de ${nota.nome}`}
                                                        form={`form-nota-${nota.id_nota}`}
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.1"
                                                        value={valoresEdicao[campo.id]}
                                                        onChange={(evento) =>
                                                            setValoresEdicao((atuais) => ({
                                                                ...atuais,
                                                                [campo.id]: evento.target.value,
                                                            }))
                                                        }
                                                        required
                                                    />
                                                ) : (
                                                    Number(nota[campo.id]).toLocaleString("pt-BR", {
                                                        maximumFractionDigits: 2,
                                                    })
                                                )}
                                            </td>
                                        ))}
                                        <td className={styles.rowActions}>
                                            {nota.id_nota === notaEditando ? (
                                                <form
                                                    id={`form-nota-${nota.id_nota}`}
                                                    onSubmit={salvarEdicao}
                                                >
                                                    <button
                                                        className={styles.actionButton}
                                                        type="submit"
                                                        disabled={acaoEmAndamento}
                                                    >
                                                        Salvar
                                                    </button>
                                                    <button
                                                        className={styles.actionButton}
                                                        type="button"
                                                        onClick={cancelarEdicao}
                                                        disabled={acaoEmAndamento}
                                                    >
                                                        Cancelar
                                                    </button>
                                                </form>
                                            ) : (
                                                <>
                                                    <button
                                                        className={styles.actionButton}
                                                        type="button"
                                                        onClick={() => iniciarEdicao(nota)}
                                                        disabled={acaoEmAndamento}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        className={`${styles.actionButton} ${styles.deleteButton}`}
                                                        type="button"
                                                        onClick={() => excluirNota(nota.id_nota)}
                                                        disabled={acaoEmAndamento}
                                                    >
                                                        Excluir
                                                    </button>
                                                </>
                                            )}
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
