// app/api/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8082'

/**
 * Proxy genérico do BFF:
 * - Encaminha /api/** para ${API_BASE_URL}/**
 * - Mantém método, querystring, body e headers relevantes
 * - NÃO adiciona credenciais por padrão; ajuste se necessário
 */

async function proxy(req: NextRequest, params: { path?: string[] }) {
  const pathSegs = params.path ?? []
  // monta URL alvo preservando querystring
  const incomingUrl = new URL(req.url)
  const target = new URL(`${API_BASE_URL}/${pathSegs.join('/')}`)
  target.search = incomingUrl.search

  const hopByHopHeaders = new Set([
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailer',
    'transfer-encoding',
    'upgrade',
  ])

  // Copia headers úteis
  const outHeaders = new Headers()
  req.headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      // Normaliza Host na origem do backend
      if (key.toLowerCase() === 'host') return
      outHeaders.set(key, value)
    }
  })

  // Opcional: extrair token de cookie e enviar em Authorization
  const token =
    req.cookies.get('token')?.value ||
    req.cookies.get('access_token')?.value ||
    req.cookies.get('Authorization')?.value

  if (token && !outHeaders.has('authorization')) {
    outHeaders.set('authorization', token.startsWith('Bearer ') ? token : `Bearer ${token}`)
  }

  // Lida com body (inclui JSON e multipart)
  const method = req.method
  const hasBody = !['GET', 'HEAD'].includes(method)
  const body = hasBody ? req.body : undefined

  const res = await fetch(target, {
    method,
    headers: outHeaders,
    body,
    // O modo "manual" evita que redirects do backend virem HTML inesperado aqui
    redirect: 'manual',
    // Importante no Next 15 (Edge/Node), deixe o runtime default (Node) para manter streaming de body
  })

  // Replica resposta (status/headers/body)
  const resHeaders = new Headers()
  res.headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      resHeaders.set(key, value)
    }
  })

  return new NextResponse(res.body, {
    status: res.status,
    headers: resHeaders,
  })
}

export const GET = (req: NextRequest, { params }: { params: { path?: string[] } }) =>
  proxy(req, params)
export const HEAD = (req: NextRequest, { params }: { params: { path?: string[] } }) =>
  proxy(req, params)
export const POST = (req: NextRequest, { params }: { params: { path?: string[] } }) =>
  proxy(req, params)
export const PUT = (req: NextRequest, { params }: { params: { path?: string[] } }) =>
  proxy(req, params)
export const PATCH = (req: NextRequest, { params }: { params: { path?: string[] } }) =>
  proxy(req, params)
export const DELETE = (req: NextRequest, { params }: { params: { path?: string[] } }) =>
  proxy(req, params)
