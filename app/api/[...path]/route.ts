// app/api/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8082'
const API_PATH_PREFIX = process.env.API_PATH_PREFIX ?? '/api/v1'

// Cabeçalhos hop-by-hop não devem ser repassados
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
])

function pickForwardHeaders(inHeaders: Headers) {
  const out = new Headers()
  inHeaders.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k.toLowerCase())) out.set(k, v)
  })
  // força Accept padrão se não vier
  if (!out.has('accept')) out.set('accept', 'application/json, */*;q=0.1')
  return out
}

type Ctx = { params: Promise<{ path?: string[] }> }

function buildTargetUrl(baseRaw: string, segments: string[]) {
  const base = new URL(baseRaw)
  const prefix = (API_PATH_PREFIX ?? '').trim()
  const normalizedPrefix = prefix ? `/${prefix.replace(/^\/+|\/+$/g, '')}` : ''
  const path = segments.filter(Boolean).join('/')
  const joined = [normalizedPrefix, path].filter(Boolean).join('/')

  const target = new URL(base.origin)
  target.pathname = joined.replace(/\/\/+/g, '/')
  return target
}

async function proxy(req: NextRequest, ctx: Ctx) {
  // (1) params precisa ser awaited
  const { path = [] } = await ctx.params

  // monta URL alvo preservando a querystring original
  const incoming = new URL(req.url)
  const target = buildTargetUrl(API_BASE_URL, path)
  target.search = incoming.search // mantém ?query=...

  const method = req.method
  const headers = pickForwardHeaders(req.headers)

  const rawToken =
    req.cookies.get('token')?.value ||
    req.cookies.get('access_token')?.value ||
    req.cookies.get('Authorization')?.value ||
    req.headers.get('Authorization') ||
    req.headers.get('authorization')

  if (rawToken) {
    const bearer = rawToken.startsWith('Bearer ') ? rawToken : `Bearer ${rawToken}`
    headers.set('Authorization', bearer)
  }

  // (2) lidar com body sem stream (evita 'duplex: half')
  let body: string | undefined
  if (!['GET', 'HEAD'].includes(method)) {
    const ct = headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      const txt = await req.text()
      body = txt // repassa string JSON
      // Garante content-type coerente
      headers.set('content-type', 'application/json; charset=utf-8')
    } else if (ct.includes('application/x-www-form-urlencoded')) {
      body = await req.text()
    } else if (ct.includes('text/')) {
      body = await req.text()
    } else {
      // fallback simples; se precisar multipart, tratar com FormData mais tarde
      body = await req.text()
    }
  }

  const backendRes = await fetch(target, {
    method,
    headers,
    body,
    // evitar caches entre proxy e backend durante dev
    cache: 'no-store',
    redirect: 'manual',
  })

  // copia headers de resposta (removendo os proibidos)
  const respHeaders = new Headers(backendRes.headers)
  ;['content-encoding', 'content-length', 'connection'].forEach(h => respHeaders.delete(h))

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    headers: respHeaders,
  })
}

// Exporta handlers para todos os métodos
export const GET = (req: NextRequest, ctx: Ctx) => proxy(req, ctx)
export const HEAD = (req: NextRequest, ctx: Ctx) => proxy(req, ctx)
export const POST = (req: NextRequest, ctx: Ctx) => proxy(req, ctx)
export const PUT = (req: NextRequest, ctx: Ctx) => proxy(req, ctx)
export const PATCH = (req: NextRequest, ctx: Ctx) => proxy(req, ctx)
export const DELETE = (req: NextRequest, ctx: Ctx) => proxy(req, ctx)
export const OPTIONS = (req: NextRequest, ctx: Ctx) => proxy(req, ctx)
