/**
 * AUTENTICAÇÃO — SENHAS E SESSÕES
 * ============================================================
 * Este arquivo cuida de duas coisas:
 *
 * 1) HASH DE SENHA com bcrypt
 *    Nunca guardamos a senha do usuário em texto puro. O bcrypt
 *    aplica um algoritmo de hash com "sal" aleatório que é
 *    impossível de reverter.
 *
 * 2) SESSÃO via JWT (JSON Web Token)
 *    Após o login, criamos um token assinado contendo o ID do
 *    usuário. Esse token vai num cookie httpOnly (não acessível
 *    pelo JavaScript do navegador, o que protege contra ataques).
 *
 *    O token expira em 7 dias.
 */
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definida no .env");
}
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

/** Duração da sessão: 7 dias */
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

/** Nome do cookie onde guardamos o token */
export const SESSION_COOKIE_NAME = "gym-capital-session";
export const SESSION_COOKIE_MAX_AGE = SESSION_DURATION_SECONDS;

/** Dados que vão dentro do token JWT */
export interface SessionPayload {
  userId: string;
  email: string;
}

// ============================================================
// SENHAS
// ============================================================

/** Transforma a senha em texto puro num hash seguro (~bcrypt). */
export async function hashSenha(senhaPlana: string): Promise<string> {
  return bcrypt.hash(senhaPlana, 12);
}

/** Verifica se a senha digitada bate com o hash guardado. */
export async function compararSenha(
  senhaPlana: string,
  hashArmazenado: string,
): Promise<boolean> {
  return bcrypt.compare(senhaPlana, hashArmazenado);
}

// ============================================================
// SESSÃO JWT
// ============================================================

/** Gera um token JWT contendo os dados do usuário. */
export async function gerarToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(SECRET_KEY);
}

/** Valida um token recebido e retorna o payload (ou null se inválido). */
export async function verificarToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY, {
      algorithms: ["HS256"],
    });
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}
