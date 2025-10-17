import { NextResponse } from "next/server"
import { z } from "zod"

const LoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

const TokenResponseSchema = z.object({
  token: z.string().min(10, "Token inválido"),
})

/**
 * POST /api/session/login
 * Authenticates user and sets HttpOnly cookie with access token
 */
export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json()
    const credentials = LoginSchema.parse(body)

    // Forward to backend API
    const upstream = await fetch(process.env.API_BASE_URL + "/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(credentials),
      cache: "no-store",
    })

    const data = await upstream.json()

    // Handle upstream errors
    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status })
    }

    // Validate token response
    const { token } = TokenResponseSchema.parse(data)

    // Create response with success message
    const res = NextResponse.json({ ok: true, message: "Login realizado com sucesso" })

    // Set HttpOnly cookie with access token
    res.cookies.set("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return res
  } catch (error: any) {
    // Handle Zod validation errors
    if (error?.name === "ZodError") {
      return NextResponse.json(
        {
          message: "Dados inválidos",
          errors: error.errors,
        },
        { status: 400 },
      )
    }

    // Handle other errors
    console.error("[Login Error]", error)
    return NextResponse.json(
      {
        message: "Erro ao fazer login",
        error: error?.message,
      },
      { status: 500 },
    )
  }
}
