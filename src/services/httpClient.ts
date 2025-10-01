const API_BASE_URL = import.meta.env.VITE_API_URL;

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
}

export async function httpRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipContentType, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);

  const apiGatewayKey = import.meta.env.VITE_API_GATEWAY_KEY;
  const apiGatewayKeyHeaderEnv = import.meta.env.VITE_API_GATEWAY_KEY_HEADER;
  if (apiGatewayKey) {
    const headerName =
      apiGatewayKeyHeaderEnv && apiGatewayKeyHeaderEnv.trim().length > 0
        ? apiGatewayKeyHeaderEnv.trim()
        : "Ocp-Apim-Subscription-Key";
    requestHeaders.set(headerName, apiGatewayKey);
  }
  if (!skipContentType && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  // build full URL safely (handle leading/trailing slashes)
  const base = API_BASE_URL.replace(/\/+$/, "");
  const route = String(path ?? "").replace(/^\/+/, "");
  const url = route ? `${base}/${route}` : base;

  // prepare body: stringify JSON when appropriate
  let body: BodyInit | undefined = (rest as any).body;
  const contentType = requestHeaders.get("Content-Type") ?? "";
  if (
    body != null &&
    contentType.includes("application/json") &&
    typeof body !== "string" &&
    !(body instanceof FormData)
  ) {
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

  const respContentType = response.headers.get("content-type");
  const isJson = respContentType?.includes("application/json");

  // handle no content
  if (response.status === 204 || respContentType == null) {
    return undefined as unknown as T;
  }

  let payload: unknown;
  try {
    payload = isJson ? await response.json() : await response.text();
  } catch (err) {
    // fallback for invalid/empty JSON
    payload = undefined;
  }

  if (!response.ok) {
    const message =
      (isJson && typeof payload === "object" && payload !== null && "message" in payload
        ? (payload as { message?: string }).message
        : undefined) ||
      response.statusText ||
      "Request failed";

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}
