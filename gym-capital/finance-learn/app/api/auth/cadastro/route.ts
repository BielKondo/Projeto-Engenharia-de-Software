import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { cadastroSchema } from "@/lib/auth/schemas";
import {
  gerarToken,
  hashSenha,
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/session";

// Verifica se é um erro de constraint unique do Prisma (código P2002)
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

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { erro: "Corpo da requisição inválido" },
      { status: 400 },
    );
  }

  const parsed = cadastroSchema.safeParse(payload);
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

  const { nome, email, senha, dataNascimento, cpf } = parsed.data;

  const senhaHash = await hashSenha(senha);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        nome,
        email,
        senhaHash,
        dataNascimento: new Date(dataNascimento),
        cpf: cpf ? cpf.replace(/\D/g, "") : null,
        aceitouTermos: true,
      },
      select: { id: true, email: true, nome: true },
    });
  } catch (err) {
    if (ehErroDuplicidade(err)) {
      const campo = err.meta?.target?.[0] ?? "email";
      const mensagem =
        campo === "email"
          ? "Este email já está cadastrado"
          : "Este CPF já está cadastrado";
      return NextResponse.json(
        { erro: mensagem, erros: { [campo]: mensagem } },
        { status: 409 },
      );
    }
    console.error("Erro no cadastro:", err);
    return NextResponse.json(
      { erro: "Erro interno ao criar conta" },
      { status: 500 },
    );
  }

  // Cria a sessão JWT
  const token = await gerarToken({ userId: user.id, email: user.email });

  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });

  return NextResponse.json({ usuario: user }, { status: 201 });
}
