import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("TodoList App"),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().default("http://localhost:8082"),
  NEXT_PUBLIC_USE_PATCH: z
    .string()
    .optional()
    .transform((value) => value === "true"),
});

function validateEnv() {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      NEXT_PUBLIC_USE_PATCH: process.env.NEXT_PUBLIC_USE_PATCH,
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("?? Environment validation warning:", error);
      return {
        NEXT_PUBLIC_APP_NAME: "TodoList App",
        NEXT_PUBLIC_API_BASE_URL: "http://localhost:8082",
        NEXT_PUBLIC_USE_PATCH: false,
      };
    }
    console.error("? Environment validation failed:", error);
    throw new Error("Invalid environment variables");
  }
}

export const env = validateEnv();
