import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./theme.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Projeto Escola",
  description: "Sistema escolar para gerenciamento de alunos e notas.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try { const tema = localStorage.getItem("tema-escola"); document.documentElement.dataset.theme = tema === "dark" || tema === "light" ? tema : "light"; } catch { document.documentElement.dataset.theme = "light"; }`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
