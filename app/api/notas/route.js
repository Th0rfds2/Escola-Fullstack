import db from "../../db/banco";
import { NextResponse } from "next/server";

function lerNotas(dados) {
    const camposNota = ["t1", "t2", "n1", "n2", "n3"];
    const notas = camposNota.map((campo) => {
        const valor = dados?.[campo];
        const valorValido =
            (typeof valor === "number" || typeof valor === "string") &&
            String(valor).trim() !== "";

        return valorValido ? Number(valor) : NaN;
    });

    if (notas.some((nota) => !Number.isFinite(nota) || nota < 0 || nota > 10)) {
        return null;
    }

    return notas;
}

export async function GET() {
    try {
        const notas = db.prepare(`
            SELECT notas.id_nota, notas.id_aluno, notas.t1, notas.t2,
                notas.n1, notas.n2, notas.n3, alunos.nome, alunos.ra
            FROM notas
            INNER JOIN alunos ON notas.id_aluno = alunos.id_aluno
            ORDER BY alunos.nome
        `).all();

        return NextResponse.json(notas);
    } catch (error) {
        console.error("Erro ao listar as notas", error);
        return NextResponse.json(
            { erro: "Erro ao listar as notas." },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    let dados;

    try {
        dados = await request.json();
    } catch (error) {
        return NextResponse.json(
            { erro: "Os dados enviados não são um JSON válido." },
            { status: 400 }
        );
    }

    const valorIdAluno = dados?.id_aluno;
    const idAlunoValido =
        (typeof valorIdAluno === "number" || typeof valorIdAluno === "string") &&
        String(valorIdAluno).trim() !== "";
    const idAluno = idAlunoValido ? Number(valorIdAluno) : NaN;
    const notas = lerNotas(dados);

    if (!Number.isInteger(idAluno) || idAluno <= 0) {
        return NextResponse.json(
            { erro: "Selecione um aluno válido." },
            { status: 400 }
        );
    }

    if (!notas) {
        return NextResponse.json(
            { erro: "Todas as notas devem estar entre 0 e 10." },
            { status: 400 }
        );
    }

    try {
        const aluno = db
            .prepare("SELECT id_aluno FROM alunos WHERE id_aluno = ?")
            .get(idAluno);

        if (!aluno) {
            return NextResponse.json(
                { erro: "Aluno não encontrado." },
                { status: 404 }
            );
        }

        db.prepare(`
            INSERT INTO notas (id_aluno, t1, t2, n1, n2, n3)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(idAluno, ...notas);

        return NextResponse.json(
            { mensagem: "Notas cadastradas com sucesso!" },
            { status: 201 }
        );
    } catch (error) {
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return NextResponse.json(
                { erro: "Este aluno já possui notas cadastradas." },
                { status: 409 }
            );
        }

        console.error("Erro ao cadastrar as notas", error);
        return NextResponse.json(
            { erro: "Erro ao cadastrar as notas." },
            { status: 500 }
        );
    }
}

export async function PUT(request) {
    let dados;

    try {
        dados = await request.json();
    } catch (error) {
        return NextResponse.json(
            { erro: "Os dados enviados não são um JSON válido." },
            { status: 400 }
        );
    }

    const valorIdNota = dados?.id_nota;
    const idNotaValido =
        (typeof valorIdNota === "number" || typeof valorIdNota === "string") &&
        String(valorIdNota).trim() !== "";
    const idNota = idNotaValido ? Number(valorIdNota) : NaN;
    const notas = lerNotas(dados);

    if (!Number.isInteger(idNota) || idNota <= 0) {
        return NextResponse.json(
            { erro: "Nota inválida." },
            { status: 400 }
        );
    }

    if (!notas) {
        return NextResponse.json(
            { erro: "Todas as notas devem estar entre 0 e 10." },
            { status: 400 }
        );
    }

    try {
        const resultado = db.prepare(`
            UPDATE notas
            SET t1 = ?, t2 = ?, n1 = ?, n2 = ?, n3 = ?
            WHERE id_nota = ?
        `).run(...notas, idNota);

        if (resultado.changes === 0) {
            return NextResponse.json(
                { erro: "Nota não encontrada." },
                { status: 404 }
            );
        }

        return NextResponse.json({ mensagem: "Notas atualizadas com sucesso!" });
    } catch (error) {
        console.error("Erro ao editar as notas", error);
        return NextResponse.json(
            { erro: "Erro ao editar as notas." },
            { status: 500 }
        );
    }
}

export async function DELETE(request) {
    let dados;

    try {
        dados = await request.json();
    } catch (error) {
        return NextResponse.json(
            { erro: "Os dados enviados não são um JSON válido." },
            { status: 400 }
        );
    }

    const valorIdNota = dados?.id_nota;
    const idNotaValido =
        (typeof valorIdNota === "number" || typeof valorIdNota === "string") &&
        String(valorIdNota).trim() !== "";
    const idNota = idNotaValido ? Number(valorIdNota) : NaN;

    if (!Number.isInteger(idNota) || idNota <= 0) {
        return NextResponse.json(
            { erro: "Nota inválida." },
            { status: 400 }
        );
    }

    try {
        const resultado = db
            .prepare("DELETE FROM notas WHERE id_nota = ?")
            .run(idNota);

        if (resultado.changes === 0) {
            return NextResponse.json(
                { erro: "Nota não encontrada." },
                { status: 404 }
            );
        }

        return NextResponse.json({ mensagem: "Notas excluídas com sucesso!" });
    } catch (error) {
        console.error("Erro ao excluir as notas", error);
        return NextResponse.json(
            { erro: "Erro ao excluir as notas." },
            { status: 500 }
        );
    }
}
