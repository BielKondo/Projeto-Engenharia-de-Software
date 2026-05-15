import type { Metadata } from "next";
import "./globals.css";
import {
  ThemeProvider,
  themeInitScript,
} from "@/contexts/ThemeContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { GastosProvider } from "@/contexts/GastosContext";

export const metadata: Metadata = {
  title: "GYM Capital — Aprenda investindo",
  description:
    "Plataforma de educação financeira e simulador de investimentos da G.Y.M.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <NotificationsProvider>
            <PortfolioProvider>
              <GastosProvider>{children}</GastosProvider>
            </PortfolioProvider>
          </NotificationsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
