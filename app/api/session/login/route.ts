// app/api/session/login/route.ts
import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8082/api"

// join simples que evita // duplos
function joinUrl(base: string, path: string) {
    return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`
}

export async function POST(req: NextRequest) {
    const loginPath = "/auth/login"
    const directUrl = joinUrl(API_BASE_URL, loginPath)
    const bffUrl = new URL(loginPath, req.nextUrl.origin).toString()

    let body: any
    try {
        body = await req.json()
    } catch {
        return NextResponse.json(
            { ok: false, message: "JSON inválido" },
            { status: 400 }
        )
    }

    // Nunca logar senha em claro
    const safeBody = {
        ...body,
        password: body?.password ? "***" : undefined,
    }

    let direct: { status?: number; data?: any } | undefined
    let viaBff: { status?: number; data?: any } | undefined

    try {
        // 1) Tenta direto no backend (diagnóstico)
        const r1 = await fetch(directUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify(body),
        })

        let data1: any = null
        try {
            data1 = await r1.clone().json()
        } catch {
            // pode não ser JSON; ignoramos
        }
        direct = { status: r1.status, data: data1 }

        // Log antes do return (como pedido)
        console.log("[LoginDebug] direct", {
            url: directUrl,
            status: direct.status,
            data: direct.data,
            body: safeBody,
        })

        // Se o direto funcionou, retorna já com headers de diagnóstico
        if (r1.ok) {
            const res = NextResponse.json(
                { ok: true, ...(data1 ?? {}) },
                {
                    status: r1.status,
                    headers: {
                        "x-login-direct-url": directUrl,
                        "x-login-direct-status": String(r1.status),
                        "x-login-bff-url": bffUrl,
                        "x-login-bff-status": "skipped",
                    },
                }
            )
            return res
        }
    } catch (e: any) {
        console.error("[LoginDebug] direct fetch failed", {
            url: directUrl,
            error: e?.message,
        })
    }

    // 2) Se falhar/401 no direto, tenta via BFF local (/api/auth/login)
    try {
        const r2 = await fetch(bffUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify(body),
        })

        let data2: any = null
        try {
            data2 = await r2.clone().json()
        } catch {
            // pode não ser JSON
        }
        viaBff = { status: r2.status, data: data2 }

        // Log antes do return (como pedido)
        console.log("[LoginDebug] bff", {
            url: bffUrl,
            status: viaBff.status,
            data: viaBff.data,
            body: safeBody,
        })

        // Sempre devolvemos os headers x-login-* para você debugar pelo Network
        const res = NextResponse.json(
            data2 ?? { ok: r2.ok },
            {
                status: r2.status,
                headers: {
                    "x-login-direct-url": directUrl,
                    "x-login-direct-status": String(direct?.status ?? 0),
                    "x-login-bff-url": bffUrl,
                    "x-login-bff-status": String(r2.status),
                },
            }
        )
        return res
    } catch (e: any) {
        console.error("[LoginDebug] bff fetch failed", {
            url: bffUrl,
            error: e?.message,
        })
        return NextResponse.json(
            { ok: false, message: "Login via BFF falhou", error: e?.message },
            {
                status: 500,
                headers: {
                    "x-login-direct-url": directUrl,
                    "x-login-direct-status": String(direct?.status ?? 0),
                    "x-login-bff-url": bffUrl,
                    "x-login-bff-status": "fetch_failed",
                },
            }
        )
    }
}
