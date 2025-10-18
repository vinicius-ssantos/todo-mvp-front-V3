import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"

export const dynamic = "force-dynamic"

const LoginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

function joinUrl(base: string, path: string) {
    const b = (base || "").replace(/\/+$/, "")
    const p = (path || "").replace(/^\/+/, "")
    return `${b}/${p}`
}

function stripBearer(t?: string) {
    return (t || "").replace(/^Bearer\s+/i, "")
}

/**
 * POST /api/session/login
 * Autentica no backend e seta cookie HttpOnly "access_token"
 */
export async function POST(req: NextRequest) {
    try {
        const { email, password } = LoginSchema.parse(await req.json())

        const base = process.env.API_BASE_URL || ""
        if (!base) {
            return NextResponse.json({ message: "API_BASE_URL ausente" }, { status: 500 })
        }

        // Se base termina com /api → "auth/login"; senão → "api/auth/login"
        const loginPath = base.endsWith("/api") ? "auth/login" : "api/auth/login"
        const url = joinUrl(base, loginPath)

        const upstream = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({ email, password }),
        })

        if (!upstream.ok) {
            let detail: any = null
            try { detail = await upstream.json() } catch {}
            const status = upstream.status || 500
            const message =
                detail?.message || (status === 401 ? "Credenciais inválidas." : "Falha ao autenticar.")
            return NextResponse.json({ ok: false, status, message, detail }, { status })
        }

        const data: any = await upstream.json()
        const raw = data?.token || data?.accessToken || data?.jwt || data?.jwtToken || ""
        const token = stripBearer(raw)

        if (!token || token.length < 10) {
            return NextResponse.json(
                { ok: false, message: "Backend não retornou { token } válido.", detail: data },
                { status: 502 }
            )
        }

        const isProd = process.env.NODE_ENV === "production"
        const res = NextResponse.json({ ok: true })
        res.cookies.set("access_token", token, {
            httpOnly: true,
            secure: isProd,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 7 dias
        })
        return res
    } catch (err: any) {
        if (err?.name === "ZodError") {
            return NextResponse.json({ message: "Dados inválidos", errors: err.errors }, { status: 400 })
        }
        console.error("[Login Error]", err)
        return NextResponse.json({ message: "Erro ao fazer login", error: err?.message }, { status: 500 })
    }
}
