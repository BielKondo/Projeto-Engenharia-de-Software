import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  verificarToken,
} from "@/lib/auth/session";

export async function GET() {
  const cookie = cookies().get(SESSION_COOKIE_NAME);
  if (!cookie?.value) {
    return NextResponse.json({ usuario: null });
  }

  const payload = await verificarToken(cookie.value);
  if (!payload) {
    return NextResponse.json({ usuario: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, nome: true, dataNascimento: true },
  });

  if (!user) {
    return NextResponse.json({ usuario: null });
  }

  return NextResponse.json({ usuario: user });
}
