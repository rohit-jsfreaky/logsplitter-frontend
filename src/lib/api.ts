import type { ApiResponse } from "@/types";
import { useAuth } from "@clerk/clerk-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

/**
 * Low-level API call helper
 * - Works with JSON and FormData
 * - Adds Authorization when token is provided
 * - Safely parses JSON or empty responses
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  try {
    const headers: HeadersInit = {
      ...(options.headers ?? {}),
    };

    // Only set JSON content-type if body is JSON string (NOT FormData)
    const hasBody = options.body !== undefined && options.body !== null;
    if (
      hasBody &&
      !isFormData(options.body) &&
      !headersHasContentType(headers)
    ) {
      (headers as Record<string, string>)["Content-Type"] = "application/json";
    }

    if (options.token) {
      (headers as Record<string, string>)[
        "Authorization"
      ] = `Bearer ${options.token}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
    });

    // Attempt JSON parse, but handle empty bodies (204) and non-json safely
    const text = await res.text();
    const data = text ? safeJsonParse(text) : null;

    if (!res.ok) {
      const msg =
        data &&
        typeof data === "object" &&
        "error" in data &&
        typeof (data as Record<string, unknown>).error === "string"
          ? ((data as Record<string, unknown>).error as string)
          : `Request failed (${res.status})`;
      return { success: false, error: msg, code: "API_ERROR" };
    }

    // Backend contract: should return ApiResponse<T>
    if (data && typeof data === "object" && "success" in data) {
      return data as ApiResponse<T>;
    }

    // If backend returned raw content unexpectedly, still wrap it
    return { success: true, data: (data as T) ?? (undefined as unknown as T) };
  } catch (err) {
    console.error("API Error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
      code: "API_ERROR",
    };
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return {
      success: false,
      error: "Invalid JSON response",
      code: "INVALID_JSON",
    };
  }
}

function headersHasContentType(headers: HeadersInit): boolean {
  if (headers instanceof Headers) return headers.has("Content-Type");
  if (Array.isArray(headers))
    return headers.some(([k]) => k.toLowerCase() === "content-type");
  return Object.keys(headers).some((k) => k.toLowerCase() === "content-type");
}

/**
 * Hook wrapper that injects Clerk token.
 * Uses optional env var VITE_CLERK_JWT_TEMPLATE if set.
 */
export function useApi() {
  const { getToken } = useAuth();

  return {
    call: async <T>(endpoint: string, options: RequestInit = {}) => {
      const template = import.meta.env.VITE_CLERK_JWT_TEMPLATE as
        | string
        | undefined;
      const token = await getToken(template ? { template } : undefined);
      return apiCall<T>(endpoint, { ...options, token });
    },
  };
}
