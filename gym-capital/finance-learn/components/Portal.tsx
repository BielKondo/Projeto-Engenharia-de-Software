"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renderiza filhos diretamente em document.body, escapando de qualquer
 * stacking context criado por pais (transform, filter, isolation, etc).
 * Isso garante que modais com position:fixed cubram a tela inteira,
 * incluindo TopBar e Sidebar.
 */
export function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;
  return createPortal(children, document.body);
}
