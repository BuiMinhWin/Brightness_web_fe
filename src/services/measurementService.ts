import type { ApiResponse } from "../models";
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
    return httpRequest<ApiResponse>(`${prefix}`, { method: "GET" });
  },

  getById(id: string) {
    return httpRequest<ApiResponse>(`${prefix}/${id}`, { method: "GET" });
  },

  create(payload: MeasurementPayload) {
    return httpRequest<ApiResponse>(`${prefix}`, {
      method: "POST",
      body: payload,
    });
  },

  update(id: string, payload: MeasurementPayload) {
    return httpRequest<ApiResponse>(`${prefix}/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  remove(id: string) {
    return httpRequest<ApiResponse>(`${prefix}/${id}`, { method: "DELETE" });
  },
};
