import {
  authenticatedFetch,
  loginUser,
  logoutUser,
} from "./auth";

const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ??
  "http://127.0.0.1:8000";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface DashboardStats {
  total_analyses: number;
  low_risk: number;
  medium_risk: number;
  high_risk: number;
  critical_risk: number;
}

export interface AnalysisHistoryItem {
  id: number;
  risk_score: number;
  risk_level: string;
  threat_type: string;
  created_at: string;
}

export interface ThreatIndicator {
  type: string;
  description: string;
  severity:
    | "low"
    | "medium"
    | "high"
    | "critical";
}

export interface URLAnalysisResult {
  url: string;
  risk_score: number;
  risk_level: string;
  indicators: ThreatIndicator[];
}

export interface RetrievedKnowledge {
  chunk_id: number;
  document_id: number;
  chunk_index: number;
  content: string;
  similarity: number;
}

export interface ThreatAnalysisResponse {
  risk_score: number;
  risk_level:
    | "low"
    | "medium"
    | "high"
    | "critical";
  threat_type: string;
  indicators: ThreatIndicator[];
  explanation: string;
  recommended_action: string;
  ai_analysis?: string;
  url_results?: URLAnalysisResult[];
  retrieved_knowledge?: RetrievedKnowledge[];
}

export interface ImageAnalysisResponse {
  filename: string;
  content_type: string;
  analysis: string;
}

/**
 * Converts backend errors into readable messages.
 */
async function getErrorMessage(
  response: Response
): Promise<string> {
  try {
    const data = await response.json();

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (Array.isArray(data?.detail)) {
      return data.detail
        .map(
          (item: { msg?: string }) =>
            item.msg || "Validation error"
        )
        .join(", ");
    }
  } catch {
    // Ignore invalid response body.
  }

  return `Request failed with status ${response.status}`;
}

/**
 * Login
 *
 * Uses the central auth.ts authentication
 * implementation so access and refresh tokens
 * are stored consistently.
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return loginUser({
    email,
    password,
  });
}

/**
 * Get current authenticated user.
 */
export async function getMe(): Promise<User> {
  const response =
    await authenticatedFetch(
      `${API_BASE_URL}/auth/me`,
      {
        method: "GET",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}

/**
 * Logout.
 */
export function logout(): void {
  logoutUser();
}

/**
 * Dashboard statistics.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response =
    await authenticatedFetch(
      `${API_BASE_URL}/dashboard/stats`,
      {
        method: "GET",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}

/**
 * Analysis history.
 */
export async function getAnalysisHistory(): Promise<
  AnalysisHistoryItem[]
> {
  const response =
    await authenticatedFetch(
      `${API_BASE_URL}/analysis/history`,
      {
        method: "GET",
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}

/**
 * Analyze text or URL.
 */
export async function analyzeText(
  text: string
): Promise<ThreatAnalysisResponse> {
  const response =
    await authenticatedFetch(
      `${API_BASE_URL}/analysis/text`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
        }),
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}

/**
 * Analyze screenshot/image.
 */
export async function analyzeImage(
  file: File
): Promise<ImageAnalysisResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response =
    await authenticatedFetch(
      `${API_BASE_URL}/analysis/image`,
      {
        method: "POST",
        body: formData,
      }
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}

/**
 * Backend health check.
 *
 * This endpoint does not require authentication.
 */
export async function checkBackendHealth(): Promise<{
  status: string;
  service: string;
  version: string;
}> {
  const response = await fetch(
    `${API_BASE_URL}/health`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(response)
    );
  }

  return response.json();
}