import { NextResponse, type NextRequest } from "next/server";
import { verificarToken, SESSION_COOKIE_NAME } from "./lib/auth/session";

const ROTAS_PUBLICAS = ["/login", "/cadastro"];
const ROTAS_API_PUBLICAS = ["/api/auth/login", "/api/auth/cadastro"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permite arquivos estáticos, _next, e APIs públicas
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    ROTAS_API_PUBLICAS.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verificarToken(token) : null;

  const ehRotaPublica = ROTAS_PUBLICAS.some((p) => pathname.startsWith(p));

  // Usuário NÃO logado tentando acessar rota privada → /login
  if (!session && !ehRotaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Usuário JÁ logado em rota pública → manda pro dashboard
  if (session && ehRotaPublica) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match em tudo, exceto:
     * - api/auth (são tratadas internamente acima quando públicas)
     * - _next/static, _next/image, favicon (assets)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
