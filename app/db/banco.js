import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Garante que o caminho seja absoluto e consistente em qualquer processo
const dbDir = path.resolve(process.cwd(), "app", "db");
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.resolve(dbDir, "escola.db");

// Padrão Singleton para evitar conexões concorrentes bloqueando o SQLite no Windows
if (!globalThis._escola_db) {
    const db = new Database(dbPath);

    // Habilita chaves estrangeiras e modo WAL (evita travamento de leitura/escrita no Windows)
    db.pragma("foreign_keys = ON");
    db.pragma("journal_mode = WAL");

    db.exec(`
        CREATE TABLE IF NOT EXISTS alunos (
            id_aluno INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            idade INTEGER NOT NULL,
            serie TEXT NOT NULL,
            ra TEXT NOT NULL UNIQUE
        );   
        CREATE TABLE IF NOT EXISTS notas (
            id_nota INTEGER PRIMARY KEY AUTOINCREMENT,
            id_aluno INTEGER NOT NULL UNIQUE,
            t1 REAL NOT NULL,
            t2 REAL NOT NULL,
            n1 REAL NOT NULL,
            n2 REAL NOT NULL,
            n3 REAL NOT NULL,
            FOREIGN KEY (id_aluno) REFERENCES alunos(id_aluno) ON DELETE CASCADE
        );   
        CREATE TABLE IF NOT EXISTS disciplinas (
            id_disciplina INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            pontuacao_minima REAL NOT NULL
        );
        CREATE TABLE IF NOT EXISTS professores (
            id_professor INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            nif TEXT NOT NULL UNIQUE,
            dias_semana TEXT NOT NULL,
            id_disciplina INTEGER NOT NULL,
            total_aulas_semana INTEGER NOT NULL,
            FOREIGN KEY (id_disciplina) REFERENCES disciplinas(id_disciplina) ON DELETE RESTRICT
        );
    `);

    // Insere disciplinas e professores de exemplo caso a tabela esteja vazia
    const totalDisciplinas = db.prepare("SELECT COUNT(*) AS total FROM disciplinas").get().total;
    if (totalDisciplinas === 0) {
        const insDisc = db.prepare("INSERT INTO disciplinas (nome, pontuacao_minima) VALUES (?, ?)");
        const d1 = insDisc.run("Matemática", 6.0).lastInsertRowid;
        const d2 = insDisc.run("Português", 6.0).lastInsertRowid;
        const d3 = insDisc.run("História", 6.0).lastInsertRowid;
        const d4 = insDisc.run("Física", 7.0).lastInsertRowid;

        const insProf = db.prepare("INSERT INTO professores (nome, nif, dias_semana, id_disciplina, total_aulas_semana) VALUES (?, ?, ?, ?, ?)");
        insProf.run("Prof. Carlos Silva", "NIF-102030", "Segunda-feira, Quarta-feira", d1, 16);
        insProf.run("Profa. Ana Souza", "NIF-104050", "Terça-feira, Quinta-feira, Sexta-feira", d2, 20);
        insProf.run("Prof. Marcos Lima", "NIF-106070", "Segunda-feira, Terça-feira", d3, 12);
        console.log("Disciplinas e professores padrão inicializados com sucesso.");
    }

    console.log("Banco de dados SQLite conectado e pronto:", dbPath);
    globalThis._escola_db = db;
}

const db = globalThis._escola_db;
export default db;
