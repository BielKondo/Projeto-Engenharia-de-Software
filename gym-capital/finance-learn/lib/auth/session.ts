import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET não definida no .env");
}
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);

// Duração da sessão: 7 dias
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

export async function hashSenha(senhaPlana: string): Promise<string> {
  return bcrypt.hash(senhaPlana, 12);
}

export async function compararSenha(
  senhaPlana: string,
  hashArmazenado: string,
): Promise<boolean> {
  return bcrypt.compare(senhaPlana, hashArmazenado);
}

export interface SessionPayload {
  userId: string;
  email: string;
}

export async function gerarToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(SECRET_KEY);
}

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

export const SESSION_COOKIE_NAME = "gym-capital-session";
export const SESSION_COOKIE_MAX_AGE = SESSION_DURATION_SECONDS;
