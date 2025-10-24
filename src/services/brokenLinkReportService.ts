import { httpRequest } from './httpClientRedux';

export interface BrokenLinkReport {
  id: string;
  exerciseId: string;
  exerciseName: string;
  brokenVideoUrl: string;
  reportedByUserId: string;
  reportedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
  adminNotes?: string;
  resolvedAt?: string;
  resolvedByUserId?: string;
  newVideoUrl?: string;
}

export interface BrokenLinkReportListItem {
  id: string;
  exerciseId: string;
  exerciseName: string;
  brokenVideoUrl: string;
  reportedAt: string;
  status: 'pending' | 'resolved' | 'dismissed';
  newVideoUrl?: string;
  reportCount: number;
  adminNotes?: string;
  resolvedAt?: string;
  userComment?: string;
  isResolved?: boolean;
}

export interface ReportBrokenLinkRequest {
  exerciseId: string;
  exerciseName: string;
  brokenVideoUrl: string;
  userId: string;
  userComment?: string;
}

export interface UpdateBrokenLinkRequest {
  status?: string;
  adminNotes?: string;
  newVideoUrl?: string;
}

export interface ResolveBrokenLinkRequest {
  newVideoUrl: string;
  adminNotes?: string;
  adminUserId: string;
}

const brokenLinkReportService = {
  /**
   * Report a broken video link (user endpoint)
   */
  reportBrokenLink: async (request: ReportBrokenLinkRequest): Promise<BrokenLinkReport> => {
    const response = await httpRequest<{ success: boolean; data: BrokenLinkReport }>(
      `/coach/api/BrokenLinkReport`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );
    return response.data;
  },

  /**
   * Get all broken link reports (admin endpoint)
   */
  getAllReports: async (status?: string): Promise<BrokenLinkReportListItem[]> => {
    const queryParams = status ? `?status=${status}` : '';
    const response = await httpRequest<{ success: boolean; data: BrokenLinkReportListItem[] }>(
      `/coach/api/BrokenLinkReport${queryParams}`,
      {
        method: 'GET',
      }
    );
    return response.data;
  },

  /**
   * Get specific broken link report (admin endpoint)
   */
  getReportById: async (id: string): Promise<BrokenLinkReport> => {
    const response = await httpRequest<{ success: boolean; data: BrokenLinkReport }>(
      `/coach/api/BrokenLinkReport/${id}`,
      {
        method: 'GET',
      }
    );
    return response.data;
  },

  /**
   * Update broken link report status/notes (admin endpoint)
   */
  updateReport: async (id: string, request: UpdateBrokenLinkRequest): Promise<BrokenLinkReport> => {
    const response = await httpRequest<{ success: boolean; data: BrokenLinkReport }>(
      `/coach/api/BrokenLinkReport/${id}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );
    return response.data;
  },

  /**
   * Resolve broken link with new URL and update exercise (admin endpoint)
   */
  resolveBrokenLink: async (id: string, request: ResolveBrokenLinkRequest): Promise<BrokenLinkReport> => {
    const response = await httpRequest<{ success: boolean; data: BrokenLinkReport }>(
      `/coach/api/BrokenLinkReport/${id}/resolve`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }
    );
    return response.data;
  },

  /**
   * Delete broken link report (admin endpoint)
   */
  deleteReport: async (id: string): Promise<void> => {
    await httpRequest<{ success: boolean; message: string }>(
      `/coach/api/BrokenLinkReport/${id}`,
      {
        method: 'DELETE',
      }
    );
  },
};

export default brokenLinkReportService;

