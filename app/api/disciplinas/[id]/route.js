import { NextResponse } from "next/server";
import db from "../../../db/banco";

export async function GET(request, { params }) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams?.id;

        const disciplina = db
            .prepare("SELECT * FROM disciplinas WHERE id_disciplina = ?")
            .get(id);

        if (!disciplina) {
            return NextResponse.json(
                { erro: "Disciplina não encontrada" },
                { status: 404 }
            );
        }

        return NextResponse.json(disciplina);
    } catch (error) {
        console.error("Erro ao buscar disciplina:", error);
        return NextResponse.json(
            { erro: "Erro ao buscar disciplina" },
            { status: 500 }
        );
    }
}

