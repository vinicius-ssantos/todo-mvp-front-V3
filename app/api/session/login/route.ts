// app/api/session/login/route.ts
import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8082'
// Se no seu backend as rotas são /api/auth/login, você pode:
// - pôr API_BASE_URL=http://localhost:8082/api e usar /auth/login
// - ou manter base sem /api e usar /api/auth/login abaixo
const LOGIN_PATH = process.env.LOGIN_PATH || '/api/auth/login'

function resolveBackendUrl(baseRaw: string, pathRaw: string) {
  const base = new URL(baseRaw)
  const basePath = base.pathname.replace(/\/$/, '')

  let path = pathRaw?.trim() || ''
  if (!path.startsWith('/')) {
    path = `/${path}`
  }

  const hasBasePath = Boolean(basePath && basePath !== '/')
  const combinedPath =
    hasBasePath && !path.startsWith(basePath) ? `${basePath}${path}` : path

  const url = new URL(base.origin)
  url.pathname = combinedPath.replace(/\/\/+/g, '/')
  return url.toString()
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Opção A (via BFF no mesmo domínio):
    // const res = await fetch(`${new URL('/api/auth/login', req.url).toString()}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password }),
    // })

    // Opção B (direto no backend, controlado por env):
    const loginUrl = resolveBackendUrl(API_BASE_URL, LOGIN_PATH)
    const res = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      redirect: 'manual',
    })

    const text = await res.text()
    let payload: any = {}
    try {
      payload = text ? JSON.parse(text) : {}
    } catch {
      // se não for JSON, mantém como string para debug
      payload = { raw: text }
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          error: payload?.error || 'login_failed',
          message: payload?.message || 'Falha ao autenticar',
          details: payload,
        },
        { status: res.status }
      )
    }

    // Tenta extrair token do JSON (ex.: {token:"..."} ou {accessToken:"..."}).
    // Se seu backend devolve Authorization no header, também suportamos.
    const headerAuth = res.headers.get('authorization') || res.headers.get('Authorization')
    const tokenFromHeader = headerAuth && headerAuth.startsWith('Bearer ')
      ? headerAuth
      : undefined

    const token =
      tokenFromHeader ||
      payload?.token ||
      payload?.accessToken ||
      (payload?.Authorization?.startsWith?.('Bearer ') ? payload.Authorization : undefined)

    if (!token) {
      return NextResponse.json(
        {
          error: 'missing_token',
          message:
            'Login retornou sucesso, mas não encontrei token na resposta. Ajuste o mapeamento.',
          details: payload,
        },
        { status: 500 }
      )
    }

    // Grava cookie httpOnly
    const cookieStore = await cookies()
    cookieStore.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 dias (ajuste)
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json(
      { error: 'unexpected', message: err?.message || 'Erro inesperado' },
      { status: 500 }
    )
  }
}
