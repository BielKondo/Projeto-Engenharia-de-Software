/**
 * ENDPOINT /api/auth/me
 * ============================================================
 *
 * GET  → retorna os dados do usuário logado (id, nome, email, dataNascimento)
 * PUT  → atualiza nome, email e/ou data de nascimento do usuário logado
 *
 * Ambos exigem cookie de sessão válido.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/server/db";
import {
  SESSION_COOKIE_NAME,
  verificarToken,
} from "@/server/auth";
import { editarPerfilSchema } from "@/server/validations";

/**
 * Verifica se há um cookie de sessão válido e retorna o ID do usuário.
 * Retorna null se não houver sessão ou se o token for inválido.
 */
async function getUserIdLogado(): Promise<string | null> {
  const cookie = cookies().get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;
  const payload = await verificarToken(cookie.value);
  return payload?.userId ?? null;
}

/** Verifica se um erro é violação de constraint unique (P2002 do Prisma) */
function ehErroDuplicidade(
  err: unknown,
): err is { code: string; meta?: { target?: string[] } } {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "P2002"
  );
}

// ============================================================
// GET — buscar dados do usuário logado
// ============================================================

export async function GET() {
  const userId = await getUserIdLogado();
  if (!userId) {
    return NextResponse.json({ usuario: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) {
    return NextResponse.json({ usuario: null });
  }

  return NextResponse.json({ usuario: user });
}

// ============================================================
// PUT — atualizar dados do perfil
// ============================================================

export async function PUT(request: Request) {
  const userId = await getUserIdLogado();
  if (!userId) {
    return NextResponse.json(
      { erro: "Não autenticado" },
      { status: 401 },
    );
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

  const parsed = editarPerfilSchema.safeParse(payload);
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

  const { nome, email, dataNascimento, idioma, moeda, avatarUrl } = parsed.data;

  try {
    const atualizado = await prisma.user.update({
      where: { id: userId },
      data: {
        nome,
        email,
        dataNascimento: new Date(dataNascimento),
        ...(idioma !== undefined && { idioma }),
        ...(moeda !== undefined && { moeda }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
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

    return NextResponse.json({ usuario: atualizado });
  } catch (err) {
    if (ehErroDuplicidade(err)) {
      const campo = err.meta?.target?.[0] ?? "email";
      const mensagem =
        campo === "email"
          ? "Este email já está cadastrado em outra conta"
          : "Este dado já está em uso";
      return NextResponse.json(
        { erro: mensagem, erros: { [campo]: mensagem } },
        { status: 409 },
      );
    }
    console.error("Erro ao atualizar perfil:", err);
    return NextResponse.json(
      { erro: "Erro interno ao atualizar perfil" },
      { status: 500 },
    );
  }
}
