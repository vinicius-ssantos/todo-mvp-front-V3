// app/api/[...path]/route.ts
import { NextRequest } from "next/server"

export const dynamic = "force-dynamic"

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8082/api"

function joinUrl(base: string, path: string) {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`
}

function isAuthPath(localPath: string) {
  const p = localPath.replace(/^\/+/, "")
  return /(^|\/)auth\//i.test(p)
}

async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const localPath = pathname.replace(/^\/api\/?/, "")
  const upstreamUrl = joinUrl(API_BASE_URL, localPath) + (search || "")
  const method = req.method.toUpperCase()

  // Copia headers base
  const headers = new Headers(req.headers)
  headers.delete("host")
  headers.delete("connection")
  headers.delete("accept-encoding")
  headers.delete("content-length")

  const cookieToken = req.cookies.get("access_token")?.value
  const useAuth = !!cookieToken && !isAuthPath(localPath)

  if (useAuth) {
    headers.set("authorization", `Bearer ${cookieToken}`)
  } else {
    headers.delete("authorization")
  }

  // Corpo: para JSON, materializa em texto (evita stream bug); senão, repassa stream
  const hasBody = !["GET", "HEAD"].includes(method)
  let upstreamBody: BodyInit | undefined = undefined

  if (hasBody) {
    const ct = headers.get("content-type") || ""
    if (ct.includes("application/json")) {
      const text = await req.text() // materializa
      upstreamBody = text
    } else {
      // fallback para stream (ex.: multipart)
      // @ts-expect-error Node fetch aceita duplex
      upstreamBody = req.body as any
    }
  }

  console.log("[BFF->Upstream]", {
    method, upstreamUrl, useAuth, hasAuthHeader: headers.has("authorization"),
  })

  let upstream: Response
  try {
    upstream = await fetch(upstreamUrl, {
      method,
      headers,
      cache: "no-store",
      // @ts-expect-error Node fetch aceita duplex
      duplex: hasBody ? "half" : undefined,
      body: upstreamBody,
    })
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

  // === MATERIALIZA A RESPOSTA DO UPSTREAM ===
  const buf = await upstream.arrayBuffer()
  const ct = upstream.headers.get("content-type") ?? "application/json"

  // Reconstroi headers essenciais + repassa Set-Cookie (se houver)
  const outHeaders = new Headers()
  outHeaders.set("content-type", ct)
  outHeaders.set("x-bff-upstream-url", upstreamUrl)
  // Repassa cookies múltiplos
  const setCookies = upstream.headers.getSetCookie?.() as string[] | undefined
  if (Array.isArray(setCookies)) {
    for (const sc of setCookies) outHeaders.append("set-cookie", sc)
  } else {
    const sc = upstream.headers.get("set-cookie")
    if (sc) outHeaders.append("set-cookie", sc)
  }

  console.log("[BFF<-Upstream]", { status: upstream.status, upstreamUrl, bytes: buf.byteLength })

  return new Response(buf, {
    status: upstream.status,
    headers: outHeaders,
  })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
export const OPTIONS = proxy
