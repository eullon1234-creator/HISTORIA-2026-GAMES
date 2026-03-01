import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Historia 2026 Games",
  description: "Catálogo pessoal de jogos estilo Netflix",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased" style={{ background: "#0d0d1a", color: "#e2e8f0" }}>
        {children}
      </body>
    </html>
  );
}
