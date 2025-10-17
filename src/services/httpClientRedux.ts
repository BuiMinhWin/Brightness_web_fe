import { jwtDecode } from "jwt-decode";
import type { AuthData } from "../models";

const API_BASE_URL = import.meta.env.VITE_API_URL;

// --- Helper functions for Auth --- //

// Lazy getters to avoid circular dependency
const getStore = () => {
  // Import at runtime to break circular dependency
  return import("../store/store").then((module) => module.store);
};

const getAuthActions = () => {
  // Import at runtime to break circular dependency
  return import("../store/slices/authSlice").then((module) => ({
    refreshAuthToken: module.refreshAuthToken,
    clearAuth: module.clearAuth,
  }));
};

const getAuthData = async (): Promise<AuthData | null> => {
  const store = await getStore();
  const state = store.getState();
  const { auth } = state;

  if (!auth.isAuthenticated || !auth.accessToken) {
    return null;
  }

  // Refresh token is now in httpOnly cookie, not in state
  return {
    accessToken: auth.accessToken,
    refreshToken: "", // Not used - kept for type compatibility
    accessTokenExpiresAt: auth.accessTokenExpiresAt || "",
    refreshTokenExpiresAt: "", // Not tracked - kept for type compatibility
  };
};

const isTokenExpired = (token: string): boolean => {
  if (!token) return true;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return (decoded.exp ?? 0) < currentTime;
  } catch {
    return true;
  }
};

// --- Refresh Token Logic --- //

let isRefreshing = false;
let refreshPromise: Promise<AuthData | null> | null = null;

const handleRefreshToken = async (): Promise<AuthData | null> => {
  const store = await getStore();
  const { refreshAuthToken, clearAuth } = await getAuthActions();

  // Refresh token is now in httpOnly cookie - no need to check state
  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = store
      .dispatch(refreshAuthToken())
      .then((result: any) => {
        if (refreshAuthToken.fulfilled.match(result)) {
          const { authData } = result.payload;
          return authData;
        } else {
          throw new Error("Failed to refresh token");
        }
      })
      .catch(async (error: any) => {
        console.error("Refresh token failed, logging out:", error);
        const store = await getStore();
        const { clearAuth } = await getAuthActions();
        store.dispatch(clearAuth());
        window.location.href = "/auth?mode=signin"; // Redirect to login
        return null;
      })
      .finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

// --- Core HTTP Request Function --- //

export class ApiError extends Error {
  public readonly status?: number;
  public readonly details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  skipContentType?: boolean;
  skipAuth?: boolean; // Option to skip sending Authorization header
  skipAutoLogout?: boolean; // Option to skip auto-logout on 401
}

export async function httpRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let auth = await getAuthData();
  const { skipContentType, skipAuth, skipAutoLogout, headers, ...rest } = options;

  // Check if access token is expired and attempt refresh
  if (auth?.accessToken && !skipAuth) {
    const isAccessExpired = isTokenExpired(auth.accessToken);

    if (isAccessExpired) {
      // Access expired - attempt refresh (refresh token is in httpOnly cookie)
      const newAuth = await handleRefreshToken();
      if (newAuth) {
        auth = newAuth;
      } else {
        // Refresh failed, stop the request
        return Promise.reject(new ApiError("Session expired. Please log in again.", 401));
      }
    }
  }

  const requestHeaders = new Headers(headers);

  // Attach Access Token if available and not skipped
  if (auth?.accessToken && !skipAuth) {
    requestHeaders.set("Authorization", `Bearer ${auth.accessToken}`);
  }

  // Attach API Gateway Key
  const apiGatewayKey = import.meta.env.VITE_API_GATEWAY_KEY;
  const apiGatewayKeyHeaderEnv = import.meta.env.VITE_API_GATEWAY_KEY_HEADER;
  if (apiGatewayKey) {
    const headerName = apiGatewayKeyHeaderEnv?.trim() || "Ocp-Apim-Subscription-Key";
    requestHeaders.set(headerName, apiGatewayKey);
  }

  if (!skipContentType && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const base = (API_BASE_URL || "").replace(/\/+$/, "");
  const route = (path || "").replace(/^\/+/, "");
  const url = route ? `${base}/${route}` : base;

  let body: BodyInit | undefined = (rest as any).body;
  if (body != null && typeof body !== "string" && !(body instanceof FormData)) {
    try {
      body = JSON.stringify(body);
    } catch (err) {
      throw new ApiError("Failed to serialize request body as JSON", undefined, err);
    }
  }

  const fetchOptions: RequestInit = {
    mode: "cors",
    credentials: "include",
    ...rest,
    headers: requestHeaders,
    body,
  };

  const response = await fetch(url, fetchOptions);

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const respContentType = response.headers.get("content-type");
  const isJson = respContentType?.includes("application/json");
  let payload: unknown;

  try {
    payload = isJson ? await response.json() : await response.text();
  } catch {
    payload = undefined;
  }

  if (!response.ok) {
    // Try to get the most detailed error message possible
    let message = response.statusText || "Request failed";
    let errorDetails = payload;

    if (isJson && typeof payload === "object" && payload !== null) {
      // Check various common error response formats
      if ("message" in payload && typeof payload.message === "string") {
        message = payload.message;
      } else if ("error" in payload && typeof payload.error === "string") {
        message = payload.error;
      } else if ("title" in payload && typeof payload.title === "string") {
        message = payload.title;
      } else if ("errors" in payload) {
        // Handle validation errors (common in ASP.NET Core)
        const errors = payload.errors as any;
        if (typeof errors === 'object' && errors !== null) {
          // Format: { "field": ["error1", "error2"] }
          const errorMessages = Object.entries(errors)
            .map(([field, msgs]) => {
              if (Array.isArray(msgs)) {
                return `${field}: ${msgs.join(', ')}`;
              }
              return `${field}: ${msgs}`;
            })
            .join('; ');
          if (errorMessages) {
            message = errorMessages;
          }
        } else if (Array.isArray(errors)) {
          // Format: [{ message: "..." }, ...]
          const errorMessages = errors
            .map((e: any) => {
              if (typeof e === 'string') return e;
              if (e.message) return e.message;
              if (e.errorMessage) return e.errorMessage;
              return JSON.stringify(e);
            })
            .join('; ');
          if (errorMessages) {
            message = errorMessages;
          }
        }
      }
    }

    // Log detailed error information for debugging
    console.error("❌ API Request Failed:", {
      url,
      method: fetchOptions.method,
      status: response.status,
      statusText: response.statusText,
      message,
      payload: errorDetails,
      requestBody: (rest as any).body,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Special case for 401 Unauthorized
    if (response.status === 401 && !skipAuth && !skipAutoLogout) {
      console.error("Unauthorized access. Logging out.");
      const store = await getStore();
      const { clearAuth } = await getAuthActions();
      store.dispatch(clearAuth());
      window.location.href = "/auth?mode=signin";
    }

    throw new ApiError(message, response.status, errorDetails);
  }

  return payload as T;
}
