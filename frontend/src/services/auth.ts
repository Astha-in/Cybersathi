import type {
  User,
  LoginRequest,
  LoginResponse,
  ApiErrorResponse,
  ApiValidationErrorItem,
} from "../types/auth";

const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ??
  "http://127.0.0.1:8000";

const STORAGE_KEYS = {
  TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER: "user",
} as const;

/* --------------------------------------------------
   Error handling
-------------------------------------------------- */

export function extractErrorMessage(
  data: unknown,
  fallbackMessage = "Authentication failed."
): string {
  if (!data || typeof data !== "object") {
    return fallbackMessage;
  }

  const errorData = data as ApiErrorResponse;

  if (typeof errorData.detail === "string") {
    return errorData.detail;
  }

  if (
    Array.isArray(errorData.detail) &&
    errorData.detail.length > 0
  ) {
    const messages = (
      errorData.detail as ApiValidationErrorItem[]
    )
      .map((item) => item.msg || "Invalid field")
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(". ");
    }
  }

  return fallbackMessage;
}

async function getResponseError(
  response: Response
): Promise<string> {
  try {
    const data = await response.json();

    return extractErrorMessage(
      data,
      `Request failed with status ${response.status}.`
    );
  } catch {
    return `Request failed with status ${response.status}.`;
  }
}

/* --------------------------------------------------
   Storage helpers
-------------------------------------------------- */

export function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

export function removeStoredToken(): void {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(
    STORAGE_KEYS.REFRESH_TOKEN
  );
}

export function setStoredRefreshToken(
  token: string
): void {
  localStorage.setItem(
    STORAGE_KEYS.REFRESH_TOKEN,
    token
  );
}

export function removeStoredRefreshToken(): void {
  localStorage.removeItem(
    STORAGE_KEYS.REFRESH_TOKEN
  );
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(
    STORAGE_KEYS.USER
  );

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem(
    STORAGE_KEYS.USER,
    JSON.stringify(user)
  );
}

export function removeStoredUser(): void {
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export function clearAuthSession(): void {
  removeStoredToken();
  removeStoredRefreshToken();
  removeStoredUser();
}

export function isUserAuthenticated(): boolean {
  return Boolean(getStoredToken());
}

/* --------------------------------------------------
   Login
-------------------------------------------------- */

export async function loginUser(
  credentials: LoginRequest
): Promise<LoginResponse> {
  let response: Response;

  try {
    response = await fetch(
      `${API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: credentials.email.trim(),
          password: credentials.password,
        }),
      }
    );
  } catch {
    throw new Error(
      "Unable to connect to CyberSathi server. Please ensure the backend is running."
    );
  }

  if (!response.ok) {
    throw new Error(
      await getResponseError(response)
    );
  }

  const data =
    (await response.json()) as LoginResponse;

  if (!data.access_token) {
    throw new Error(
      "Authentication response did not include an access token."
    );
  }

  if (!data.refresh_token) {
    throw new Error(
      "Authentication response did not include a refresh token."
    );
  }

  setStoredToken(data.access_token);
  setStoredRefreshToken(data.refresh_token);
  setStoredUser(data.user);

  return data;
}
/* --------------------------------------------------
   JWT Helper
-------------------------------------------------- */

export function isJwtExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload) as { exp?: number };
    if (!payload.exp) return true;
    // Buffer by 10 seconds before actual expiration to prevent race conditions
    return Date.now() >= payload.exp * 1000 - 10000;
  } catch {
    return true;
  }
}

/* --------------------------------------------------
   Refresh token
-------------------------------------------------- */

let refreshPromise: Promise<string> | null = null;

async function requestNewAccessToken(): Promise<string> {
  const refreshToken =
    getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error(
      "Refresh token is missing."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}/auth/refresh?refresh_token=${encodeURIComponent(
      refreshToken
    )}`,
    {
      method: "POST",
    }
  );

  if (response.status === 401) {
    clearAuthSession();

    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  if (!response.ok) {
    throw new Error(
      await getResponseError(response)
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    token_type: string;
  };

  if (!data.access_token) {
    throw new Error(
      "Server did not return a new access token."
    );
  }

  setStoredToken(data.access_token);

  return data.access_token;
}

async function refreshAccessToken(): Promise<string> {
  /*
   * Prevent multiple simultaneous API requests
   * from creating multiple refresh requests.
   */
  if (!refreshPromise) {
    refreshPromise = requestNewAccessToken();

    refreshPromise.finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

/* --------------------------------------------------
   Authenticated fetch
-------------------------------------------------- */

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let accessToken = getStoredToken();
  const refreshToken = getStoredRefreshToken();

  if (!accessToken && !refreshToken) {
    throw new Error(
      "Authentication token not found."
    );
  }

  /*
   * Proactively refresh the access token if it is expired or missing,
   * as long as we have a refresh token. This prevents sending an expired token
   * and avoiding the 401 response in the browser console.
   */
  if ((!accessToken || isJwtExpired(accessToken)) && refreshToken) {
    accessToken = await refreshAccessToken();
  }

  if (!accessToken) {
    throw new Error(
      "Authentication token not found."
    );
  }

  /*
   * First request with current access token.
   */
  const headers = new Headers(
    options.headers
  );

  headers.set(
    "Authorization",
    `Bearer ${accessToken}`
  );

  let response = await fetch(url, {
    ...options,
    headers,
  });

  /*
   * Request succeeded.
   */
  if (response.status !== 401) {
    return response;
  }

  /*
   * Reactive fallback: Access token was unexpectedly rejected.
   * Refresh it using the refresh token and retry once.
   */
  accessToken = await refreshAccessToken();

  const retryHeaders = new Headers(
    options.headers
  );

  retryHeaders.set(
    "Authorization",
    `Bearer ${accessToken}`
  );

  response = await fetch(url, {
    ...options,
    headers: retryHeaders,
  });

  return response;
}

/* --------------------------------------------------
   Current user
-------------------------------------------------- */

export async function fetchCurrentUser(): Promise<User> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/auth/me`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error(
      await getResponseError(response)
    );
  }

  const user =
    (await response.json()) as User;

  setStoredUser(user);

  return user;
}

/* --------------------------------------------------
   Google OAuth
-------------------------------------------------- */

export function initiateGoogleLogin(): void {
  window.location.href = `${API_BASE_URL}/auth/google/login`;
}

export function handleGoogleAuthTokens(
  accessToken: string,
  refreshToken: string,
  user: User
): void {
  setStoredToken(accessToken);
  setStoredRefreshToken(refreshToken);
  setStoredUser(user);
}

/* --------------------------------------------------
   Logout
-------------------------------------------------- */

export function logoutUser(): void {
  clearAuthSession();
}