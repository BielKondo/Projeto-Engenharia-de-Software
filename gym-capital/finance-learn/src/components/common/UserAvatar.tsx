/**
 * AVATAR DO USUÁRIO
 * ============================================================
 * Componente reutilizável que mostra:
 *   - A foto de perfil (avatarUrl) se houver
 *   - As iniciais do nome como fallback
 *
 * Usado na TopBar, página de Perfil, e em qualquer outro lugar
 * que precise mostrar o avatar.
 */
"use client";

import { classNames } from "@/utils/format";

interface Props {
  nome: string;
  avatarUrl?: string | null;
  /** Tamanho em pixels (largura = altura) */
  tamanho?: number;
  /** Classes adicionais aplicadas ao container */
  className?: string;
}

export function UserAvatar({
  nome,
  avatarUrl,
  tamanho = 36,
  className,
}: Props) {
  const iniciais = gerarIniciais(nome);
  const fontSize = Math.round(tamanho * 0.4);

  return (
    <div
      className={classNames(
        "rounded-full overflow-hidden bg-gradient-to-br from-brand to-brand-soft flex items-center justify-center font-semibold text-white shrink-0",
        className,
      )}
      style={{ width: tamanho, height: tamanho, fontSize }}
    >
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={`Avatar de ${nome}`}
          className="w-full h-full object-cover"
        />
      ) : (
        iniciais
      )}
    </div>
  );
}

export function gerarIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}
