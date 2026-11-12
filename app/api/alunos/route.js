import db from "../../db/banco";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Listar alunos ordenando pelo nome
export async function GET() {
    try {
        const alunos = db.prepare('SELECT * FROM alunos ORDER BY nome').all();
        return NextResponse.json(alunos);
    } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        return NextResponse.json({ erro: "Erro ao buscar alunos." }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const dados = await request.json();
        if (!dados.nome || !dados.ra) {
            return NextResponse.json({ erro: "Nome e RA são obrigatórios." }, { status: 400 });
        }
        const sql = db.prepare(`INSERT INTO alunos (nome, idade, serie, ra) VALUES (?,?,?,?)`);
        sql.run(dados.nome, dados.idade, dados.serie, dados.ra);
        return NextResponse.json({
            mensagem: "Aluno cadastrado com sucesso!"
        }, { status: 201 });
    } catch (error) {
        console.error('Erro ao realizar o cadastro', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return NextResponse.json({ erro: "Já existe um aluno com este RA." }, { status: 400 });
        }
        return NextResponse.json({ erro: "Erro ao cadastrar aluno." }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const dados = await request.json();
        const sql = db.prepare(`
            UPDATE alunos
            SET nome = ?, idade = ?, serie = ?, ra = ?
            WHERE id_aluno = ?
        `);
        sql.run(dados.nome, dados.idade, dados.serie, dados.ra, dados.id_aluno);
        return NextResponse.json({
            mensagem: "Aluno atualizado com sucesso!"
        });
    } catch (erro) {
        console.error('Erro ao editar o aluno ', erro);
        return NextResponse.json({ erro: "Erro ao editar o aluno." }, { status: 500 });
    }
}

// Excluir aluno pelo id_aluno
export async function DELETE(request) {
    try {
        let id_aluno = null;
        try {
            const dados = await request.json();
            id_aluno = dados.id_aluno;
        } catch {
            // body vazio
        }

        if (!id_aluno) {
            return NextResponse.json({ erro: 'ID do aluno não informado.' }, { status: 400 });
        }

        const sql = db.prepare(`DELETE FROM alunos WHERE id_aluno = ?`);
        sql.run(id_aluno);
        return NextResponse.json({
            mensagem: "Aluno excluído com sucesso!"
        });
    } catch (erro) {
        console.error('Erro ao excluir o aluno ', erro);
        return NextResponse.json({ erro: 'Erro ao excluir o aluno.' }, { status: 500 });
    }
}
