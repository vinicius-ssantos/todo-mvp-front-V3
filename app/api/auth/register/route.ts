import { NextRequest, NextResponse } from 'next/server'
import { resolveBackendUrl } from '../../_utils'

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8082'
const REGISTER_PATH = process.env.REGISTER_PATH || '/api/auth/register'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'missing_fields', message: 'Email e senha são obrigatórios' },
        { status: 400 },
      )
    }

    const registerUrl = resolveBackendUrl(API_BASE_URL, REGISTER_PATH)
    const backendRes = await fetch(registerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      redirect: 'manual',
    })

    const text = await backendRes.text()
    let payload: any = {}
    try {
      payload = text ? JSON.parse(text) : {}
    } catch {
      payload = { raw: text }
    }

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          error: payload?.error || 'register_failed',
          message: payload?.message || 'Falha ao criar conta',
          details: payload,
        },
        { status: backendRes.status },
      )
    }

    return NextResponse.json(payload)
  } catch (err: any) {
    return NextResponse.json(
      { error: 'unexpected', message: err?.message || 'Erro inesperado' },
      { status: 500 },
    )
  }
}
