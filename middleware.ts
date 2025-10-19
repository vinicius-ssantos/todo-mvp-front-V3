import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Rotas públicas:
 * - Páginas públicas /login e /register
 * - BFF público de auth: /api/auth/**
 * - (opcional) alias /auth/**, caso exista no projeto
 * - Assets do Next e favicon
 */
const PUBLIC_PATHS: RegExp[] = [
  /^\/login$/,
  /^\/register$/,
  /^\/api\/auth(\/.*)?$/,    // BFF pra AUTH do backend
  /^\/auth(\/.*)?$/,         // alias opcional; se não usa, pode remover
  /^\/_next\/.*/,
  /^\/favicon\.ico$/,
]

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((re) => re.test(pathname))
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  // Deixe passar tudo que for público
  if (isPublic(pathname)) {
    return NextResponse.next()
  }

  // Verifique presença de sessão (ajuste o nome do cookie se necessário)
  const token =
    req.cookies.get('token')?.value ||
    req.cookies.get('access_token')?.value ||
    req.cookies.get('Authorization')?.value

  // Sem token? redireciona para /login preservando "next"
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.search = `?next=${encodeURIComponent(pathname + (search || ''))}`
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

/**
 * IMPORTANTÍSSIMO:
 * Não rode o middleware em:
 * - /api/** (inclui o BFF e evita interceptar POSTs de API)
 * - /auth/** (se você mantém um alias sem /api)
 * - assets estáticos
 */
export const config = {
  matcher: [
    // tudo exceto api/, auth/, _next/ e favicon
    '/((?!api/|auth/|_next/|favicon\\.ico).*)',
  ],
}
