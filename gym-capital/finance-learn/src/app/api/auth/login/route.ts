import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/server/db";
import { loginSchema } from "@/server/validations";
import {
  compararSenha,
  gerarToken,
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_NAME,
} from "@/server/auth";

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

  const parsed = loginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { erro: "Email ou senha inválidos" },
      { status: 400 },
    );
  }

  const { email, senha } = parsed.data;

  // Sempre faz o bcrypt mesmo se o usuário não existir, para evitar
  // timing attack que distingue "usuário não existe" de "senha errada".
  const user = await prisma.user.findUnique({ where: { email } });

  // Hash dummy quando user inexistente
  const hashParaComparar =
    user?.senhaHash ??
    "$2a$12$0000000000000000000000O0000000000000000000000000000000000.";

  const senhaOk = await compararSenha(senha, hashParaComparar);

  if (!user || !senhaOk) {
    return NextResponse.json(
      { erro: "Email ou senha incorretos" },
      { status: 401 },
    );
  }

  const token = await gerarToken({ userId: user.id, email: user.email });

  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });

  return NextResponse.json({
    usuario: { id: user.id, email: user.email, nome: user.nome },
  });
}
