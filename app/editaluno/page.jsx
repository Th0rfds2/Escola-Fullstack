import { Suspense } from "react";
import EditAlunoPage from './[id]/page';

export default function EditAluno(){
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <EditAlunoPage />
        </Suspense>
    );
}
