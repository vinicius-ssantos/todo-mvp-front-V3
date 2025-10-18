import { NextResponse, type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

function joinUrl(base: string, path: string, search?: string) {
    const b = (base || "").replace(/\/+$/, "")
    const p = (path || "").replace(/^\/api\/?/, "").replace(/^\/+/, "")
    return `${b}/${p}${search ? `?${search}` : ""}`
}
function isAuthPath(localPath: string) {
    const p = localPath.replace(/^\/+/, "")
    return p.startsWith("auth/") // cobre /auth/login e /auth/register
}
function stripBearer(t?: string) {
    return (t || "").replace(/^Bearer\s+/i, "")
}

async function handleRequest(req: NextRequest) {
    const start = Date.now()
    try {
        const base = process.env.API_BASE_URL || ""
        if (!base) {
            return NextResponse.json({ message: "API_BASE_URL ausente" }, { status: 500 })
        }

        const localPath = req.nextUrl.pathname.replace(/^\/api/, "")
        const search = req.nextUrl.searchParams.toString()
        const url = joinUrl(base, localPath, search)

        const headers = new Headers(req.headers)
        headers.delete("host")
        headers.delete("cookie")

        const cookieToken = stripBearer(req.cookies.get("access_token")?.value)
        const useAuth = Boolean(cookieToken) && !isAuthPath(localPath)
        if (useAuth) {
            headers.set("Authorization", `Bearer ${cookieToken}`)
        } else {
            headers.delete("authorization")
        }

        let body: BodyInit | null = null
        const method = req.method.toUpperCase()
        if (!["GET", "HEAD"].includes(method)) {
            const ct = headers.get("content-type") || ""
            if (ct.includes("multipart/form-data")) {
                body = await req.formData()
            } else {
                body = await req.text()
            }
        }

        const upstream = await fetch(url, { method, headers, body, cache: "no-store" })
        const resHeaders = new Headers(upstream.headers)
        resHeaders.set("Access-Control-Allow-Origin", "*")
        resHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        resHeaders.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
        resHeaders.set("x-bff-latency-ms", String(Date.now() - start))
        resHeaders.set("x-bff-auth", useAuth ? "1" : "0") // 👈 diagnosticar se o token foi usado

        const blob = await upstream.blob()
        return new NextResponse(blob, { status: upstream.status, headers: resHeaders })
    } catch (err: any) {
        console.error("[BFF Error]", err)
        return NextResponse.json({ message: "Erro no proxy/BFF", error: err?.message }, { status: 500 })
    }
}

export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
        },
    })
}
