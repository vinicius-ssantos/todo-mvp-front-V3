import { type NextRequest, NextResponse } from "next/server"

/**
 * Universal proxy/BFF that forwards requests to the backend API
 * Automatically injects Authorization header from HttpOnly cookie
 */
async function handleRequest(req: NextRequest) {
  const startTime = Date.now()

  try {
    // Extract path from URL (remove /api prefix)
    const path = req.nextUrl.pathname.replace(/^\/api/, "")
    const searchParams = req.nextUrl.searchParams.toString()
    const url = `${process.env.API_BASE_URL}${path}${searchParams ? `?${searchParams}` : ""}`

    // Get access token from cookie
    const token = req.cookies.get("access_token")?.value

    // Prepare headers
    const headers = new Headers()

    // Copy relevant headers from original request
    const headersToForward = ["content-type", "accept", "accept-language"]
    headersToForward.forEach((header) => {
      const value = req.headers.get(header)
      if (value) headers.set(header, value)
    })

    // Inject Authorization header if token exists
    if (token && !headers.has("authorization")) {
      headers.set("Authorization", `Bearer ${token}`)
    }

    // Prepare request body
    let body: BodyInit | null = null
    if (req.method !== "GET" && req.method !== "HEAD") {
      const contentType = req.headers.get("content-type") || ""
      if (contentType.includes("application/json")) {
        body = JSON.stringify(await req.json())
      } else {
        body = await req.text()
      }
    }

    // Forward request to upstream API
    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
      // @ts-ignore - duplex is needed for streaming
      duplex: "half",
    })

    // Log request for observability
    const duration = Date.now() - startTime
    console.log(`[Proxy] ${req.method} ${path} → ${upstream.status} (${duration}ms)`)

    // Get response body
    const contentType = upstream.headers.get("content-type") || ""
    let responseBody: any

    if (contentType.includes("application/json")) {
      responseBody = await upstream.json()
    } else {
      responseBody = await upstream.text()
    }

    // Create response with same status and headers
    const response = NextResponse.json(responseBody, {
      status: upstream.status,
      statusText: upstream.statusText,
    })

    // Copy relevant response headers
    const headersToCopy = ["content-type", "cache-control", "etag"]
    headersToCopy.forEach((header) => {
      const value = upstream.headers.get(header)
      if (value) response.headers.set(header, value)
    })

    // Add CORS headers if needed
    response.headers.set("Access-Control-Allow-Credentials", "true")

    return response
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`[Proxy Error] ${req.method} ${req.nextUrl.pathname} (${duration}ms)`, error)

    return NextResponse.json(
      {
        message: "Erro ao processar requisição",
        error: error?.message || "Erro desconhecido",
      },
      { status: 500 },
    )
  }
}

// Export handlers for all HTTP methods
export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
export const OPTIONS = async (req: NextRequest) => {
  // Handle CORS preflight
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
