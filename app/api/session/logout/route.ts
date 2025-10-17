import { NextResponse } from "next/server"

/**
 * POST /api/session/logout
 * Clears the access token cookie
 */
export async function POST() {
  const res = NextResponse.json({ ok: true, message: "Logout realizado com sucesso" })

  // Clear the access token cookie
  res.cookies.set("access_token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0, // Expire immediately
  })

  return res
}
