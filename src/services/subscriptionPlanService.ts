// File: src/services/subscriptionPlanService.ts

import { httpRequest } from "./httpClient";
import type { ApiResponse } from "../models/common";
import type {
  SubscriptionPlan,
  SubscriptionPlanPayload,
  SubscriptionPlanListResponse,
  SubscriptionPlanFilter,
} from "../models/subscriptionPlan";

// Base URL for subscription plan API endpoints
const plansBaseUrl = "/billing/api/billing/plans";

export const subscriptionPlanService = {
  /**
   * Lấy danh sách tất cả các gói đăng ký với các tùy chọn lọc
   * @param filter - Các tham số lọc và phân trang
   * @returns Danh sách gói đăng ký và thông tin phân trang
   */
  async getPlans(filter?: SubscriptionPlanFilter): Promise<SubscriptionPlanListResponse> {
    // Xây dựng query params từ filter
    const queryParams = new URLSearchParams();

    if (filter) {
      if (filter.pageNumber !== undefined)
        queryParams.append("pageNumber", filter.pageNumber.toString());
      if (filter.pageSize !== undefined) queryParams.append("pageSize", filter.pageSize.toString());
      // Sử dụng onlyActive thay vì isActive để khớp với tham số API mong đợi
      if (filter.isActive !== undefined)
        queryParams.append("onlyActive", filter.isActive.toString());
      if (filter.searchTerm) queryParams.append("searchTerm", filter.searchTerm);
      if (filter.sortBy) queryParams.append("sortBy", filter.sortBy);
      if (filter.sortDirection) queryParams.append("sortDirection", filter.sortDirection);
    }

    const queryString = queryParams.toString();
    const url = queryString ? `${plansBaseUrl}?${queryString}` : plansBaseUrl;

    try {
      const response = await httpRequest<any>(url, {
        method: "GET",
      });

      // Xử lý các cấu trúc phản hồi có thể có
      let plansData: SubscriptionPlanListResponse = { items: [] };

      if (Array.isArray(response)) {
        // Mảng trực tiếp các gói đăng ký
        plansData = { items: response };
      } else if ("flag" in response && "data" in response) {
        // ApiResponse tiêu chuẩn có flag và data
        if (!response.flag) {
          throw new Error(response.message || "Không thể lấy danh sách gói đăng ký");
        }
        if (Array.isArray(response.data)) {
          // Data là một mảng các gói
          plansData = { items: response.data };
        } else if (response.data && "items" in response.data) {
          // Data chứa mảng items
          plansData = response.data;
        } else if (response.data) {
          // Một gói duy nhất trong data
          plansData = { items: [response.data] };
        }
      } else if ("items" in response && Array.isArray(response.items)) {
        // Phản hồi trực tiếp với mảng items
        plansData = response as SubscriptionPlanListResponse;
      } else if ("data" in response && response.data && "items" in response.data) {
        // Bọc trong thuộc tính data không có flag
        plansData = response.data;
      } else {
        // Trả về mảng rỗng thay vì ném lỗi để tránh làm hỏng UI
        plansData = { items: [] };
      }

      return plansData;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách gói đăng ký:", error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết của một gói đăng ký theo ID
   * @param id - ID của gói đăng ký cần xem
   * @returns Chi tiết gói đăng ký
   */
  async getPlanById(id: string): Promise<SubscriptionPlan> {
    try {
      const response = await httpRequest<any>(`${plansBaseUrl}/${id}`, {
        method: "GET",
      });

      // Xử lý nhiều định dạng response có thể có
      if (response && typeof response === "object") {
        // Trường hợp 1: Đối tượng response là trực tiếp SubscriptionPlan
        if (response.id && response.name !== undefined && response.price !== undefined) {
          return response as SubscriptionPlan;
        }

        // Trường hợp 2: ApiResponse chuẩn với flag và data
        if ("flag" in response && response.flag && response.data) {
          return response.data;
        }

        // Trường hợp 3: Bọc trong data nhưng không có flag
        if ("data" in response && response.data && typeof response.data === "object") {
          if (response.data.id && response.data.name !== undefined) {
            return response.data;
          }
        }
      }

      throw new Error("Không thể xử lý dữ liệu gói đăng ký từ phản hồi API");
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin gói đăng ký ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo một gói đăng ký mới
   * @param payload - Dữ liệu của gói đăng ký mới
   * @returns Gói đăng ký vừa được tạo
   */
  async createPlan(payload: SubscriptionPlanPayload): Promise<SubscriptionPlan> {
    try {
      const response = await httpRequest<any>(plansBaseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Xử lý các dạng response khác nhau
      if (response && typeof response === "object") {
        // Trường hợp standard API response
        if ("flag" in response && response.flag && response.data) {
          return response.data;
        }

        // Trường hợp direct object
        if (response.id && response.name !== undefined) {
          return response as SubscriptionPlan;
        }

        // Trường hợp wrapped trong data
        if ("data" in response && response.data && typeof response.data === "object") {
          if (response.data.id) {
            return response.data;
          }
        }
      }

      throw new Error("Không thể xử lý dữ liệu phản hồi khi tạo gói đăng ký");
    } catch (error) {
      console.error("Lỗi khi tạo gói đăng ký:", error);
      throw error;
    }
  },

  /**
   * Cập nhật một gói đăng ký
   * @param id - ID của gói đăng ký cần cập nhật
   * @param payload - Dữ liệu cập nhật
   * @returns Gói đăng ký sau khi cập nhật
   */
  async updatePlan(
    id: string,
    payload: Partial<SubscriptionPlanPayload>
  ): Promise<SubscriptionPlan> {
    try {
      const response = await httpRequest<any>(`${plansBaseUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Xử lý nhiều định dạng response có thể có
      if (response && typeof response === "object") {
        // Trường hợp standard API response
        if ("flag" in response && response.flag && response.data) {
          return response.data;
        }

        // Trường hợp direct object
        if (response.id && response.name !== undefined) {
          return response as SubscriptionPlan;
        }

        // Trường hợp wrapped trong data
        if ("data" in response && response.data && typeof response.data === "object") {
          if (response.data.id) {
            return response.data;
          }
        }
      }

      throw new Error("Không thể xử lý dữ liệu phản hồi khi cập nhật gói đăng ký");
    } catch (error) {
      console.error(`Lỗi khi cập nhật gói đăng ký ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa một gói đăng ký
   * @param id - ID của gói đăng ký cần xóa
   * @returns true nếu xóa thành công
   */
  async deletePlan(id: string): Promise<boolean> {
    try {
      const response = await httpRequest<any>(`${plansBaseUrl}/${id}`, {
        method: "DELETE",
      });

      // Kiểm tra các trường hợp response khác nhau
      if (response && typeof response === "object") {
        // Trường hợp standard API response
        if ("flag" in response) {
          return !!response.flag;
        }

        // Trường hợp success status
        if ("success" in response) {
          return !!response.success;
        }

        // Trường hợp status code
        if (
          "statusCode" in response &&
          (response.statusCode === 200 || response.statusCode === 204)
        ) {
          return true;
        }
      }

      // Nếu chỉ trả về true/false
      if (response === true) {
        return true;
      }

      // Mặc định nếu có response nhưng không phù hợp với các trường hợp trên
      return true;
    } catch (error) {
      console.error(`Lỗi khi xóa gói đăng ký ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Kích hoạt hoặc vô hiệu hóa một gói đăng ký
   * @param id - ID của gói đăng ký
   * @param isActive - true để kích hoạt, false để vô hiệu hóa
   * @returns Gói đăng ký sau khi cập nhật trạng thái
   */
  async togglePlanStatus(id: string, isActive: boolean): Promise<SubscriptionPlan> {
    try {
      const response = await httpRequest<any>(`${plansBaseUrl}/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });

      // Xử lý nhiều định dạng response có thể có
      if (response && typeof response === "object") {
        // Trường hợp standard API response
        if ("flag" in response && response.flag && response.data) {
          return response.data;
        }

        // Trường hợp direct object
        if (response.id && response.name !== undefined) {
          return response as SubscriptionPlan;
        }

        // Trường hợp wrapped trong data
        if ("data" in response && response.data && typeof response.data === "object") {
          if (response.data.id) {
            return response.data;
          }
        }
      }

      throw new Error(`Không thể ${isActive ? "kích hoạt" : "vô hiệu hóa"} gói đăng ký`);
    } catch (error) {
      console.error(`Lỗi khi thay đổi trạng thái gói đăng ký ID ${id}:`, error);
      throw error;
    }
  },
};
