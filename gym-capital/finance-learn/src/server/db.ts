/**
 * CLIENTE DO BANCO DE DADOS
 * ============================================================
 * Aqui criamos UMA instância do Prisma para todo o app.
 *
 * Por que isso é necessário?
 *   Em dev, o Next.js recompila o código a cada salvamento. Sem este
 *   "singleton", isso criaria centenas de conexões com o banco até
 *   esgotar o pool. Salvar a instância no `globalThis` evita isso.
 *
 * Em produção, esse problema não existe — mas o código funciona igual.
 */
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
