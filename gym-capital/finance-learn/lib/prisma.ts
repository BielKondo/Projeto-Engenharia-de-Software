import { PrismaClient } from "@prisma/client";

// Em desenvolvimento, o Next.js faz hot-reload e cria novas instâncias do
// PrismaClient. Para evitar exaurir o pool de conexões, reusamos a instância
// global durante hot-reload.

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
