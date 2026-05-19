import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import {
  ThemeProvider,
  themeInitScript,
} from "@/contexts/ThemeContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { GastosProvider } from "@/contexts/GastosContext";
import { AuthProvider, type Usuario } from "@/contexts/AuthContext";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  verificarToken,
} from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "GYM Capital — Aprenda investindo",
  description:
    "Plataforma de educação financeira e simulador de investimentos da G.Y.M.",
};

// Busca usuário logado server-side para evitar flash de UI não autenticada
async function buscarUsuarioLogado(): Promise<Usuario | null> {
  const cookie = cookies().get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;

  const payload = await verificarToken(cookie.value);
  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, nome: true, dataNascimento: true },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      dataNascimento: user.dataNascimento.toISOString(),
    };
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    return null;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await buscarUsuarioLogado();

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-navy-900 text-ink min-h-screen">
        <ThemeProvider>
          <AuthProvider usuarioInicial={usuario}>
            <NotificationsProvider>
              <PortfolioProvider>
                <GastosProvider>{children}</GastosProvider>
              </PortfolioProvider>
            </NotificationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
