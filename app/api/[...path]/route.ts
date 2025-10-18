// app/api/[...path]/route.ts
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8082/api"

// Junta respeitando barras
function joinUrl(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`
}

// Qualquer coisa sob /auth/** é rota pública de auth (não injeta Authorization)
function isAuthPath(localPath: string) {
  const p = localPath.replace(/^\/+/, "")
  return /(^|\/)auth\//i.test(p)
}

async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const localPath = pathname.replace(/^\/api\/?/, "") // tira o prefixo /api/
  const upstreamUrl = joinUrl(API_BASE_URL, localPath) + (search || "")

  const method = req.method.toUpperCase()

  // Copia headers úteis, removendo os que não fazem sentido para upstream
  const headers = new Headers(req.headers)
  headers.delete("host")
  headers.delete("connection")
  headers.delete("accept-encoding")

  // Controle de Authorization por cookie (ex.: access_token)
  const cookieToken = req.cookies.get("access_token")?.value
  const useAuth = !!cookieToken && !isAuthPath(localPath)

  if (useAuth) {
    headers.set("authorization", `Bearer ${cookieToken}`)
  } else {
    headers.delete("authorization")
  }

  // Logs ANTES do fetch (como pedido)
  console.log("[BFF->Upstream]", {
    method,
    upstreamUrl,
    useAuth,
    hasAuthHeader: headers.has("authorization"),
  })

  // Pass-through de body (quando houver). Em Node 18+, para streaming, usar duplex: 'half'
  const hasBody = !["GET", "HEAD"].includes(method)
  const init: RequestInit = {
    method,
    headers,
    cache: "no-store",
    // @ts-expect-error Node fetch aceita duplex
    duplex: hasBody ? "half" : undefined,
    body: hasBody ? req.body : undefined,
  }

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, init)
  } catch (e: any) {
    console.error("[BFF error] fetch failed", { upstreamUrl, error: e?.message })
    return new Response(
      JSON.stringify({ ok: false, message: "Upstream indisponível", error: e?.message }),
      {
        status: 502,
        headers: {
          "content-type": "application/json",
          "x-bff-upstream-url": upstreamUrl,
        },
      }
    )
  }

  // Logs DEPOIS do fetch (como pedido)
  console.log("[BFF<-Upstream]", {
    status: upstream.status,
    upstreamUrl,
  })

  // Repasse de headers essenciais
  const outHeaders = new Headers(upstream.headers)
  outHeaders.set("x-bff-upstream-url", upstreamUrl)

  // Evita problemas com encodings transfer-encoding/chunked
  outHeaders.delete("content-encoding")
  outHeaders.delete("transfer-encoding")
  outHeaders.delete("content-length")

  return new Response(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  })
}

// Exporta todos os métodos que você usa
export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const OPTIONS = proxy
