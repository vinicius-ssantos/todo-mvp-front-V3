// app/api/session/login/route.ts
import { NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8082/api"

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
        return NextResponse.json({ ok: false, message: "JSON inválido" }, { status: 400 })
    }

    const safeBody = { ...body, password: body?.password ? "***" : undefined }

    // --- 1) Tenta DIRETO no backend (diagnóstico)
    let directStatus = 0
    try {
        const r1 = await fetch(directUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify(body),
        })
        directStatus = r1.status
        let data1: any = null
        let text1: string | undefined

        try { data1 = await r1.clone().json() } catch { /* pode não ser json */ }
        try { text1 = await r1.clone().text() } catch {}

        console.log("[LoginDebug] direct", {
            url: directUrl, status: r1.status, data: data1, text: text1, body: safeBody,
        })

        if (r1.ok && data1?.token) {
            // opcional: setar cookie da sessão aqui
            return NextResponse.json(
                { ok: true, token: data1.token },
                {
                    status: 200,
                    headers: {
                        "x-login-direct-url": directUrl,
                        "x-login-direct-status": String(r1.status),
                        "x-login-bff-url": bffUrl,
                        "x-login-bff-status": "skipped",
                        "x-login-final": "direct-200-token",
                    },
                }
            )
        }
    } catch (e: any) {
        console.error("[LoginDebug] direct fetch failed", { url: directUrl, error: e?.message })
    }

    // --- 2) Tenta VIA BFF (materializado)
    try {
        const r2 = await fetch(bffUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify(body),
        })

        let data2: any = null
        let text2: string | undefined
        try { data2 = await r2.clone().json() } catch {}
        try { text2 = await r2.clone().text() } catch {}

        console.log("[LoginDebug] bff", {
            url: bffUrl, status: r2.status, data: data2, text: text2, body: safeBody,
        })

        if (r2.ok && data2?.token) {
            return NextResponse.json(
                { ok: true, token: data2.token },
                {
                    status: 200,
                    headers: {
                        "x-login-direct-url": directUrl,
                        "x-login-direct-status": String(directStatus || 0),
                        "x-login-bff-url": bffUrl,
                        "x-login-bff-status": String(r2.status),
                        "x-login-final": "bff-200-token",
                    },
                }
            )
        }

        // Se chegou aqui, BFF respondeu mas sem token
        return NextResponse.json(
            { ok: false, message: "Backend (via BFF) não retornou { token } válido.", detail: { data2, text2 } },
            {
                status: 502,
                headers: {
                    "x-login-direct-url": directUrl,
                    "x-login-direct-status": String(directStatus || 0),
                    "x-login-bff-url": bffUrl,
                    "x-login-bff-status": String(r2.status),
                    "x-login-final": "bff-200-no-token",
                },
            }
        )
    } catch (e: any) {
        console.error("[LoginDebug] bff fetch failed", { url: bffUrl, error: e?.message })
        return NextResponse.json(
            { ok: false, message: "Login via BFF falhou", error: e?.message },
            {
                status: 500,
                headers: {
                    "x-login-direct-url": directUrl,
                    "x-login-direct-status": String(directStatus || 0),
                    "x-login-bff-url": bffUrl,
                    "x-login-bff-status": "fetch_failed",
                    "x-login-final": "bff-fetch-failed",
                },
            }
        )
    }
}
