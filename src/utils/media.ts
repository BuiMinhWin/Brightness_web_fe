const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

const ensureLeadingSlash = (value: string) => (value.startsWith("/") ? value : `/${value}`);

export const resolveApiAssetUrl = (value?: string | null): string => {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^data:image/i.test(trimmed) || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (!API_BASE_URL) {
    return ensureLeadingSlash(trimmed.replace(/^\/+/, ""));
  }

  if (trimmed.startsWith("/")) {
    return `${API_BASE_URL}${trimmed}`;
  }

  return `${API_BASE_URL}/${trimmed.replace(/^\/+/, "")}`;
};
