import { NextResponse, type NextRequest } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value
  if (!token) return NextResponse.json({ ok: false, message: "Sem token" }, { status: 401 })
  // decode base64url (apenas debug local, sem validar assinatura)
  const [h, p] = token.split(".")
  const decode = (s: string) => JSON.parse(Buffer.from(s, "base64url").toString("utf8"))
  let header: any = null, payload: any = null
  try { header = decode(h); payload = decode(p) } catch {}
  return NextResponse.json({ ok: true, header, payload })
}
