import { NextResponse } from "next/server";
import db from "../../../db/banco";

export async function GET(request, { params }) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams?.id;

        const professor = db.prepare(`
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
            WHERE p.id_professor = ?
        `).get(id);

        if (!professor) {
            return NextResponse.json(
                { erro: "Professor não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(professor);
    } catch (error) {
        console.error("Erro ao buscar professor:", error);
        return NextResponse.json(
            { erro: "Erro ao buscar professor" },
            { status: 500 }
        );
    }
}

