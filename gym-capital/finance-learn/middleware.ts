/**
 * MIDDLEWARE DE AUTENTICAÇÃO
 * ============================================================
 * Roda ANTES de qualquer página carregar. Verifica se o usuário
 * está logado (via cookie de sessão) e:
 *
 *   - Se NÃO está logado e tenta acessar rota privada → /login
 *   - Se ESTÁ logado e tenta acessar /login ou /cadastro → /
 *
 * As únicas rotas que dispensam autenticação são:
 *   - /login, /cadastro (páginas públicas)
 *   - /api/auth/login, /api/auth/cadastro (endpoints públicos)
 *   - Arquivos estáticos (_next, favicon)
 */
import { NextResponse, type NextRequest } from "next/server";
import { verificarToken, SESSION_COOKIE_NAME } from "./src/server/auth";

const ROTAS_PUBLICAS = ["/login", "/cadastro"];
const API_PUBLICAS = ["/api/auth/login", "/api/auth/cadastro"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Deixa passar: assets estáticos e APIs de login/cadastro
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    API_PUBLICAS.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // Verifica se há sessão válida
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verificarToken(token) : null;

  const ehPublica = ROTAS_PUBLICAS.some((p) => pathname.startsWith(p));

  // Não logado tentando rota privada → /login
  if (!session && !ehPublica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Já logado tentando /login ou /cadastro → vai pro dashboard
  if (session && ehPublica) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
