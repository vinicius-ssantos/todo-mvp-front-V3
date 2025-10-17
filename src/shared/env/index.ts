import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("TodoList App"),
  API_BASE_URL: z.string().url(),
  NEXT_PUBLIC_USE_PATCH: z
    .string()
    .optional()
    .transform((v) => v === "true"),
})

function validateEnv() {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      API_BASE_URL: process.env.API_BASE_URL,
      NEXT_PUBLIC_USE_PATCH: process.env.NEXT_PUBLIC_USE_PATCH,
    })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ Environment validation warning:", error)
      // Return defaults in development
      return {
        NEXT_PUBLIC_APP_NAME: "TodoList App",
        API_BASE_URL: "http://localhost:8080",
        NEXT_PUBLIC_USE_PATCH: false,
      }
    }
    console.error("❌ Environment validation failed:", error)
    throw new Error("Invalid environment variables")
  }
}

export const env = validateEnv()
