/**
 * ENDPOINT /api/auth/senha
 * ============================================================
 *
 * PUT  → altera a senha do usuário logado
 *
 * Exige a senha atual como confirmação de identidade.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/server/db";
import {
  SESSION_COOKIE_NAME,
  verificarToken,
  compararSenha,
  hashSenha,
} from "@/server/auth";
import { alterarSenhaSchema } from "@/server/validations";

async function getUserIdLogado(): Promise<string | null> {
  const cookie = cookies().get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;
  const payload = await verificarToken(cookie.value);
  return payload?.userId ?? null;
}

export async function PUT(request: Request) {
  const userId = await getUserIdLogado();
  if (!userId) {
    return NextResponse.json({ erro: "Não autenticado" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { erro: "Corpo da requisição inválido" },
      { status: 400 },
    );
  }

  const parsed = alterarSenhaSchema.safeParse(payload);
  if (!parsed.success) {
    const erros: Record<string, string> = {};
    parsed.error.issues.forEach((issue) => {
      const campo = issue.path[0] as string;
      if (!erros[campo]) erros[campo] = issue.message;
    });
    return NextResponse.json(
      { erro: "Dados inválidos", erros },
      { status: 400 },
    );
  }

  const { senhaAtual, novaSenha } = parsed.data;

  // Busca o usuário pra confirmar a senha atual
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, senhaHash: true },
  });

  if (!user) {
    return NextResponse.json(
      { erro: "Usuário não encontrado" },
      { status: 404 },
    );
  }

  const senhaCorreta = await compararSenha(senhaAtual, user.senhaHash);
  if (!senhaCorreta) {
    return NextResponse.json(
      {
        erro: "Senha atual incorreta",
        erros: { senhaAtual: "Senha atual incorreta" },
      },
      { status: 401 },
    );
  }

  // Hash da nova senha e atualiza
  const novoHash = await hashSenha(novaSenha);
  await prisma.user.update({
    where: { id: userId },
    data: { senhaHash: novoHash },
  });

  return NextResponse.json({ ok: true });
}
