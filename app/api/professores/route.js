import db from "../../db/banco";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Listar todos os professores com dados da disciplina responsável
export async function GET() {
    try {
        const professores = db.prepare(`
            SELECT 
                p.id_professor,
                p.nome,
                p.nif,
                p.dias_semana,
                p.id_disciplina,
                p.total_aulas_semana,
                d.nome AS disciplina_nome,
                d.pontuacao_minima AS disciplina_pontuacao_minima
            FROM professores p
            LEFT JOIN disciplinas d ON p.id_disciplina = d.id_disciplina
            ORDER BY p.nome ASC
        `).all();

        return NextResponse.json(professores);
    } catch (error) {
        console.error("Erro ao listar professores:", error);
        return NextResponse.json({ erro: "Erro ao buscar professores." }, { status: 500 });
    }
}

// Cadastrar novo professor
export async function POST(request) {
    try {
        const dados = await request.json();

        if (!dados.nome || dados.nome.trim() === "") {
            return NextResponse.json({ erro: "O nome do professor é obrigatório." }, { status: 400 });
        }

        if (!dados.nif || String(dados.nif).trim() === "") {
            return NextResponse.json({ erro: "A matrícula (NIF) é obrigatória." }, { status: 400 });
        }

        let diasFormatados = "";
        if (Array.isArray(dados.dias_semana)) {
            diasFormatados = dados.dias_semana.filter(Boolean).join(", ");
        } else if (typeof dados.dias_semana === "string") {
            diasFormatados = dados.dias_semana.trim();
        }

        if (!diasFormatados) {
            return NextResponse.json({ erro: "Informe os dias que o professor ministra aula." }, { status: 400 });
        }

        if (!dados.id_disciplina) {
            return NextResponse.json({ erro: "Selecione a disciplina pela qual o professor é responsável." }, { status: 400 });
        }

        // Valida se a disciplina existe
        const disciplina = db.prepare("SELECT id_disciplina FROM disciplinas WHERE id_disciplina = ?").get(dados.id_disciplina);
        if (!disciplina) {
            return NextResponse.json({ erro: "A disciplina selecionada não existe." }, { status: 400 });
        }

        if (dados.total_aulas_semana === undefined || dados.total_aulas_semana === null || dados.total_aulas_semana === "") {
            return NextResponse.json({ erro: "Informe o total de aulas na semana." }, { status: 400 });
        }

        const totalAulas = Number(dados.total_aulas_semana);
        if (isNaN(totalAulas) || totalAulas < 1) {
            return NextResponse.json({ erro: "O total de aulas na semana deve ser no mínimo 1." }, { status: 400 });
        }

        const nifFormatado = String(dados.nif).trim();

        // Verifica unicidade de NIF
        const nifExistente = db.prepare("SELECT id_professor FROM professores WHERE nif = ?").get(nifFormatado);
        if (nifExistente) {
            return NextResponse.json({ erro: "Já existe um professor cadastrado com este NIF/Matrícula." }, { status: 400 });
        }

        const sql = db.prepare(`
            INSERT INTO professores (nome, nif, dias_semana, id_disciplina, total_aulas_semana)
            VALUES (?, ?, ?, ?, ?)
        `);
        const resultado = sql.run(dados.nome.trim(), nifFormatado, diasFormatados, dados.id_disciplina, totalAulas);

        return NextResponse.json({
            mensagem: "Professor cadastrado com sucesso!",
            id_professor: resultado.lastInsertRowid
        }, { status: 201 });
    } catch (error) {
        console.error("Erro ao cadastrar professor:", error);
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return NextResponse.json({ erro: "Já existe um professor cadastrado com este NIF/Matrícula." }, { status: 400 });
        }
        return NextResponse.json({ erro: "Erro ao cadastrar professor." }, { status: 500 });
    }
}

// Atualizar professor existente
export async function PUT(request) {
    try {
        const dados = await request.json();

        if (!dados.id_professor) {
            return NextResponse.json({ erro: "ID do professor não informado." }, { status: 400 });
        }

        if (!dados.nome || dados.nome.trim() === "") {
            return NextResponse.json({ erro: "O nome do professor é obrigatório." }, { status: 400 });
        }

        if (!dados.nif || String(dados.nif).trim() === "") {
            return NextResponse.json({ erro: "A matrícula (NIF) é obrigatória." }, { status: 400 });
        }

        let diasFormatados = "";
        if (Array.isArray(dados.dias_semana)) {
            diasFormatados = dados.dias_semana.filter(Boolean).join(", ");
        } else if (typeof dados.dias_semana === "string") {
            diasFormatados = dados.dias_semana.trim();
        }

        if (!diasFormatados) {
            return NextResponse.json({ erro: "Informe os dias que o professor ministra aula." }, { status: 400 });
        }

        if (!dados.id_disciplina) {
            return NextResponse.json({ erro: "Selecione a disciplina pela qual o professor é responsável." }, { status: 400 });
        }

        const disciplina = db.prepare("SELECT id_disciplina FROM disciplinas WHERE id_disciplina = ?").get(dados.id_disciplina);
        if (!disciplina) {
            return NextResponse.json({ erro: "A disciplina selecionada não existe." }, { status: 400 });
        }

        const totalAulas = Number(dados.total_aulas_semana);
        if (isNaN(totalAulas) || totalAulas < 1) {
            return NextResponse.json({ erro: "O total de aulas na semana deve ser no mínimo 1." }, { status: 400 });
        }

        const nifFormatado = String(dados.nif).trim();

        // Verifica unicidade de NIF para outro professor
        const nifExistente = db.prepare("SELECT id_professor FROM professores WHERE nif = ? AND id_professor != ?").get(nifFormatado, dados.id_professor);
        if (nifExistente) {
            return NextResponse.json({ erro: "Já existe outro professor cadastrado com este NIF/Matrícula." }, { status: 400 });
        }

        const sql = db.prepare(`
            UPDATE professores
            SET nome = ?, nif = ?, dias_semana = ?, id_disciplina = ?, total_aulas_semana = ?
            WHERE id_professor = ?
        `);
        const resultado = sql.run(dados.nome.trim(), nifFormatado, diasFormatados, dados.id_disciplina, totalAulas, dados.id_professor);

        if (resultado.changes === 0) {
            return NextResponse.json({ erro: "Professor não encontrado." }, { status: 404 });
        }

        return NextResponse.json({
            mensagem: "Professor atualizado com sucesso!"
        });
    } catch (error) {
        console.error("Erro ao atualizar professor:", error);
        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return NextResponse.json({ erro: "Já existe outro professor cadastrado com este NIF/Matrícula." }, { status: 400 });
        }
        return NextResponse.json({ erro: "Erro ao atualizar professor." }, { status: 500 });
    }
}

// Excluir professor
export async function DELETE(request) {
    try {
        let id_professor = null;

        const url = new URL(request.url);
        const queryId = url.searchParams.get("id");

        if (queryId) {
            id_professor = queryId;
        } else {
            try {
                const dados = await request.json();
                id_professor = dados.id_professor;
            } catch {
                // Corpo vazio ou inválido
            }
        }

        if (!id_professor) {
            return NextResponse.json({ erro: "ID do professor não informado." }, { status: 400 });
        }

        const sql = db.prepare("DELETE FROM professores WHERE id_professor = ?");
        const resultado = sql.run(id_professor);

        if (resultado.changes === 0) {
            return NextResponse.json({ erro: "Professor não encontrado." }, { status: 404 });
        }

        return NextResponse.json({
            mensagem: "Professor excluído com sucesso!"
        });
    } catch (error) {
        console.error("Erro ao excluir professor:", error);
        return NextResponse.json({ erro: "Erro ao excluir professor." }, { status: 500 });
    }
}

