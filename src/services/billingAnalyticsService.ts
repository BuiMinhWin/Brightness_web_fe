import { httpRequest } from "./httpClient";

export interface AiUsageDailyPoint {
  date: string;
  tokens: number;
  cost: number;
}

export interface AiUsageSummaryResponse {
  startDate: string;
  endDate: string;
  totalTokens: number;
  totalCost: number;
  currency: string;
  daily: AiUsageDailyPoint[];
}

export interface AiUsageParams {
  startDate?: string;
  endDate?: string;
}

export async function getAiUsageSummary(params?: AiUsageParams): Promise<AiUsageSummaryResponse> {
  const searchParams = new URLSearchParams();
  if (params?.startDate) searchParams.append("startDate", params.startDate);
  if (params?.endDate) searchParams.append("endDate", params.endDate);

  const query = searchParams.toString();
  const url = `/chat/usage`;

  return httpRequest<AiUsageSummaryResponse>(url, { method: "GET" });
}
