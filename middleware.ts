import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Protege rotas privadas e evita acessar /login já autenticado
 */
export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    const publicPaths = ["/login", "/register"]
    const isPublic = publicPaths.some((p) => pathname.startsWith(p))

    const token = req.cookies.get("access_token")?.value

    // Já logado → evita /login e /register
    if (isPublic && token) {
        const url = req.nextUrl.clone()
        url.pathname = "/"
        return NextResponse.redirect(url)
    }

    // Protege rotas privadas quando não há token
    const isSessionApi = pathname.startsWith("/api/session")
    const isStatic = pathname.startsWith("/_next") || pathname.startsWith("/public")
    if (!isPublic && !isSessionApi && !isStatic && !token) {
        const url = req.nextUrl.clone()
        url.pathname = "/login"
        url.searchParams.set("next", pathname)
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        // tudo exceto assets estáticos e as rotas de sessão
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/session).*)",
    ],
}
