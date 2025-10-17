import type { ApiResponse } from "../models/common";
import { httpRequest } from "./httpClient";

const prefix = "/measurement/api/measurements";

export interface MeasurementPayload {
  userId: string;
  deviceId?: string;
  source?: number;
  recordedAt?: string;
  [key: string]: unknown;
}

export const measurementService = {
  list() {
    return httpRequest<ApiResponse<MeasurementPayload[]>>(`${prefix}`, { method: "GET" });
  },

  getById(id: string) {
    return httpRequest<ApiResponse<MeasurementPayload>>(`${prefix}/${id}`, { method: "GET" });
  },

  create(payload: MeasurementPayload) {
    return httpRequest<ApiResponse<MeasurementPayload>>(`${prefix}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: MeasurementPayload) {
    return httpRequest<ApiResponse<MeasurementPayload>>(`${prefix}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  remove(id: string) {
    return httpRequest<ApiResponse<string>>(`${prefix}/${id}`, { method: "DELETE" });
  },
};
