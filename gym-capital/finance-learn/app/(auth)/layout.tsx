import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GYM Capital — Entrar",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-navy-900 text-ink flex flex-col">
      {children}
    </div>
  );
}
