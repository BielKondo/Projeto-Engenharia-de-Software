import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import {
  ThemeProvider,
  themeInitScript,
} from "@/state/theme";
import { NotificationsProvider } from "@/state/notifications";
import { PortfolioProvider } from "@/state/portfolio";
import { GastosProvider } from "@/state/expenses";
import { AuthProvider, type Usuario } from "@/state/auth";
import { I18nProvider } from "@/state/i18n";
import { prisma } from "@/server/db";
import {
  SESSION_COOKIE_NAME,
  verificarToken,
} from "@/server/auth";
import type { Idioma, Moeda } from "@/types";

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
      select: {
        id: true,
        email: true,
        nome: true,
        dataNascimento: true,
        idioma: true,
        moeda: true,
        avatarUrl: true,
      },
    });
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      nome: user.nome,
      dataNascimento: user.dataNascimento.toISOString(),
      idioma: (user.idioma as Idioma) ?? "pt-BR",
      moeda: (user.moeda as Moeda) ?? "BRL",
      avatarUrl: user.avatarUrl ?? null,
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
    <html lang={usuario?.idioma ?? "pt-BR"} suppressHydrationWarning>
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
            <I18nProvider>
              <NotificationsProvider>
                <PortfolioProvider>
                  <GastosProvider>{children}</GastosProvider>
                </PortfolioProvider>
              </NotificationsProvider>
            </I18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
