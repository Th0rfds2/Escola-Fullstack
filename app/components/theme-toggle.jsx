'use client';

export default function ThemeToggle() {
    function alternarTema() {
        const elementoRaiz = document.documentElement;
        const proximoTema =
            elementoRaiz.dataset.theme === "dark" ? "light" : "dark";

        elementoRaiz.dataset.theme = proximoTema;

        try {
            localStorage.setItem("tema-escola", proximoTema);
        } catch (error) {
            console.error("Não foi possível salvar a preferência de tema:", error);
        }
    }

    return (
        <button
            type="button"
            onClick={alternarTema}
            aria-label="Alternar entre modo claro e modo escuro"
            className="themeToggle"
        >
            <span aria-hidden="true">◐</span>
            <span>Alternar tema</span>
        </button>
    );
}
