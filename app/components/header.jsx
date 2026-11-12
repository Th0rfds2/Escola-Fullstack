import Link from "next/link";
import estilos from './header.module.css';
import ThemeToggle from "./theme-toggle";

export default function Header() {
    return (
        <header className={estilos.header}>
            <h1 className={estilos.title}>
                <Link href='/' style={{ color: "inherit", textDecoration: "none" }}>
                    Projeto Escola
                </Link>
            </h1>
            <nav>
                <ul className={estilos.menu}>
                    <li><Link href='/'>Início</Link></li>
                    <li><Link href='/cadaluno'>Alunos - Cadastro</Link></li>
                    <li><Link href='/listaluno'>Alunos - Lista</Link></li>
                    <li><Link href='/notaluno'>Notas - Cadastro</Link></li>
                    <li><Link href='/listnota'>Notas - Lista</Link></li>
                    <li><Link href='/caddisciplina'>Disciplinas - Cadastro</Link></li>
                    <li><Link href='/listdisciplina'>Disciplinas - Lista</Link></li>
                    <li><Link href='/cadprofessor'>Professores - Cadastro</Link></li>
                    <li><Link href='/listprofessor'>Professores - Lista</Link></li>
                </ul>
            </nav>
            <ThemeToggle />
        </header>
    );
}
