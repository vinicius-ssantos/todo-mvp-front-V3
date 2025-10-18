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

export async function POST(req: Request) {
    try {
        const { email, password } = LoginSchema.parse(await req.json())

        const base = process.env.API_BASE_URL || ""
        if (!base) {
            return Response.json({ message: "API_BASE_URL ausente" }, { status: 500 })
        }

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
            const message = detail?.message || (status === 401 ? "Credenciais inválidas." : "Falha ao autenticar.")
            return Response.json({ ok: false, status, message, detail }, { status })
        }

        const data: any = await upstream.json()
        const raw = data?.token || data?.accessToken || data?.jwt || data?.jwtToken || ""
        const token = stripBearer(raw)

        if (!token || token.length < 10) {
            return Response.json(
                { ok: false, message: "Backend não retornou { token } válido.", detail: data },
                { status: 502 }
            )
        }

        const isProd = process.env.NODE_ENV === "production"
        const res = Response.json({ ok: true })
        res.headers.append(
            "Set-Cookie",
            [
                `access_token=${token}`,
                "Path=/",
                "HttpOnly",
                `SameSite=Lax`,
                isProd ? "Secure" : "",
                `Max-Age=${60 * 60 * 24 * 7}`,
            ].filter(Boolean).join("; ")
        )
        return res
    } catch (err: any) {
        if (err?.name === "ZodError") {
            return Response.json({ message: "Dados inválidos", errors: err.errors }, { status: 400 })
        }
        console.error("[Login Error]", err)
        return Response.json({ message: "Erro ao fazer login", error: err?.message }, { status: 500 })
    }
}
