import db from "../../db/banco";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Listar todas as disciplinas ordenadas pelo nome
export async function GET() {
    try {
        const disciplinas = db.prepare("SELECT * FROM disciplinas ORDER BY nome ASC").all();
        return NextResponse.json(disciplinas);
    } catch (error) {
        console.error("Erro ao listar disciplinas:", error);
        return NextResponse.json({ erro: "Erro ao buscar disciplinas." }, { status: 500 });
    }
}

// Cadastrar nova disciplina
export async function POST(request) {
    try {
        const dados = await request.json();

        if (!dados.nome || dados.nome.trim() === "") {
            return NextResponse.json({ erro: "O nome da disciplina é obrigatório." }, { status: 400 });
        }

        if (dados.pontuacao_minima === undefined || dados.pontuacao_minima === null || dados.pontuacao_minima === "") {
            return NextResponse.json({ erro: "A pontuação mínima para passar é obrigatória." }, { status: 400 });
        }

        const pontuacao = Number(dados.pontuacao_minima);
        if (isNaN(pontuacao) || pontuacao < 0) {
            return NextResponse.json({ erro: "A pontuação mínima deve ser um número válido (maior ou igual a zero)." }, { status: 400 });
        }

        const sql = db.prepare("INSERT INTO disciplinas (nome, pontuacao_minima) VALUES (?, ?)");
        const resultado = sql.run(dados.nome.trim(), pontuacao);

        return NextResponse.json({
            mensagem: "Disciplina cadastrada com sucesso!",
            id_disciplina: resultado.lastInsertRowid
        }, { status: 201 });
    } catch (error) {
        console.error("Erro ao cadastrar disciplina:", error);
        return NextResponse.json({ erro: "Erro ao cadastrar disciplina." }, { status: 500 });
    }
}

// Atualizar disciplina existente
export async function PUT(request) {
    try {
        const dados = await request.json();

        if (!dados.id_disciplina) {
            return NextResponse.json({ erro: "ID da disciplina não informado." }, { status: 400 });
        }

        if (!dados.nome || dados.nome.trim() === "") {
            return NextResponse.json({ erro: "O nome da disciplina é obrigatório." }, { status: 400 });
        }

        const pontuacao = Number(dados.pontuacao_minima);
        if (isNaN(pontuacao) || pontuacao < 0) {
            return NextResponse.json({ erro: "A pontuação mínima deve ser um número válido." }, { status: 400 });
        }

        const sql = db.prepare("UPDATE disciplinas SET nome = ?, pontuacao_minima = ? WHERE id_disciplina = ?");
        const resultado = sql.run(dados.nome.trim(), pontuacao, dados.id_disciplina);

        if (resultado.changes === 0) {
            return NextResponse.json({ erro: "Disciplina não encontrada." }, { status: 404 });
        }

        return NextResponse.json({
            mensagem: "Disciplina atualizada com sucesso!"
        });
    } catch (error) {
        console.error("Erro ao atualizar disciplina:", error);
        return NextResponse.json({ erro: "Erro ao atualizar disciplina." }, { status: 500 });
    }
}

// Excluir disciplina
export async function DELETE(request) {
    try {
        let id_disciplina = null;

        // Suporta tanto body JSON quanto query params (?id=X)
        const url = new URL(request.url);
        const queryId = url.searchParams.get("id");

        if (queryId) {
            id_disciplina = queryId;
        } else {
            try {
                const dados = await request.json();
                id_disciplina = dados.id_disciplina;
            } catch {
                // Corpo vazio ou inválido
            }
        }

        if (!id_disciplina) {
            return NextResponse.json({ erro: "ID da disciplina não informado." }, { status: 400 });
        }

        // Verifica se há professores vinculados a esta disciplina
        const professores = db.prepare("SELECT COUNT(*) AS total FROM professores WHERE id_disciplina = ?").get(id_disciplina);
        if (professores && professores.total > 0) {
            return NextResponse.json({
                erro: `Não é possível excluir: existem ${professores.total} professor(es) vinculado(s) a esta disciplina.`
            }, { status: 400 });
        }

        const sql = db.prepare("DELETE FROM disciplinas WHERE id_disciplina = ?");
        const resultado = sql.run(id_disciplina);

        if (resultado.changes === 0) {
            return NextResponse.json({ erro: "Disciplina não encontrada." }, { status: 404 });
        }

        return NextResponse.json({
            mensagem: "Disciplina excluída com sucesso!"
        });
    } catch (error) {
        console.error("Erro ao excluir disciplina:", error);
        return NextResponse.json({ erro: "Erro ao excluir disciplina." }, { status: 500 });
    }
}

