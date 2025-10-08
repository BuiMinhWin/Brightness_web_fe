import { jwtDecode } from "jwt-decode";
import type { AuthData } from "../models";
import { authService } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const AUTH_STORAGE_KEY = "auth";

// --- Helper functions for Auth --- //

const getAuthData = (): AuthData | null => {
  const authJson = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!authJson) return null;
  try {
    return JSON.parse(authJson) as AuthData;
  } catch {
    return null;
  }
};

const setAuthData = (authData: AuthData) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
};

const clearAuthData = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
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
  const auth = getAuthData();
  if (!auth?.refreshToken) {
    clearAuthData();
    window.location.href = "/auth?mode=signin"; // Redirect to login
    return Promise.reject(new Error("No refresh token available."));
  }

  if (!isRefreshing) {
    isRefreshing = true;
    refreshPromise = authService
      .refreshToken(auth.refreshToken)
      .then((response) => {
        if (!response.flag || !response.data) {
          throw new Error("Failed to refresh token");
        }
        setAuthData(response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Refresh token failed, logging out:", error);
        clearAuthData();
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
}

export async function httpRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let auth = getAuthData();
  const { skipContentType, skipAuth, headers, ...rest } = options;

  // If token is expired, refresh it
  if (auth?.accessToken && isTokenExpired(auth.accessToken) && !skipAuth) {
    const newAuth = await handleRefreshToken();
    if (newAuth) {
      auth = newAuth;
    } else {
      // Refresh failed, stop the request
      return Promise.reject(new ApiError("Session expired. Please log in again.", 401));
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
    const message =
      (isJson && typeof payload === "object" && payload !== null && "message" in payload
        ? (payload as { message?: string }).message
        : undefined) ||
      response.statusText ||
      "Request failed";

    // Special case for 401 Unauthorized, maybe the token expired just now
    // This is a simple implementation; a more robust one might retry the request
    if (response.status === 401 && !skipAuth) {
      console.error("Unauthorized access. Logging out.");
      clearAuthData();
      window.location.href = "/auth?mode=signin";
    }

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}
