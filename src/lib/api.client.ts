import type {
  AuthPayload,
  CreatePromptInput,
  Prompt,
  UpdatePromptInput,
} from "@/types";

const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";
const authedApiBaseUrl = "/api/node";

const DEFAULT_ERROR_MESSAGE = "요청 처리 중 오류가 발생했습니다.";

const STATUS_ERROR_MESSAGES: Record<number, string> = {
  400: "요청이 올바르지 않습니다.",
  401: "로그인이 필요합니다.",
  403: "권한이 없습니다.",
  404: "요청한 데이터를 찾을 수 없습니다.",
  409: "이미 처리된 요청입니다.",
  413: "업로드 용량이 너무 큽니다.",
  422: "입력값을 확인해주세요.",
  429: "요청이 많습니다. 잠시 후 다시 시도해주세요.",
  500: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  502: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  503: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  504: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
};

function normalizeErrorMessage(status: number): string {
  if (STATUS_ERROR_MESSAGES[status]) return STATUS_ERROR_MESSAGES[status];

  return DEFAULT_ERROR_MESSAGE;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    const rawText = text || "";
    console.error("API Error:", {
      status: response.status,
      message: rawText || "(empty response body)",
    });
    throw new Error(normalizeErrorMessage(response.status));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function apiFetch(baseUrl: string, path: string, init?: RequestInit) {
  const headers = new Headers(init?.headers ?? {});

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${baseUrl}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });
}

function publicFetch(path: string, init?: RequestInit) {
  return apiFetch(publicApiBaseUrl, path, init);
}

function authedFetch(path: string, init?: RequestInit) {
  return apiFetch(authedApiBaseUrl, path, init);
}

export const signUpClient = async (
  email: string,
  password: string,
  name: string,
): Promise<AuthPayload> => {
  const response = await publicFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      username: name,
    }),
  });

  return parseResponse<AuthPayload>(response);
};

export const signInClient = async (
  email: string,
  password: string,
): Promise<{ user: AuthPayload["user"] }> => {
  const response = await publicFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return parseResponse<{ user: AuthPayload["user"] }>(response);
};

export const signOutClient = async () => {
  const response = await publicFetch("/auth/logout", {
    method: "POST",
  });
  await parseResponse<void>(response);
};

export const promptApiClient = {
  getAll: async (): Promise<Prompt[]> => {
    const response = await publicFetch("/prompts", { cache: "no-store" });
    return parseResponse<Prompt[]>(response);
  },

  getById: async (id: string): Promise<Prompt | null> => {
    const response = await publicFetch(`/prompts/${id}`, {
      cache: "no-store",
    });
    if (response.status === 404) return null;
    return parseResponse<Prompt>(response);
  },

  create: async (data: CreatePromptInput): Promise<Prompt> => {
    const response = await authedFetch("/prompts/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return parseResponse<Prompt>(response);
  },

  delete: async (id: string): Promise<void> => {
    const response = await authedFetch(`/prompts/${id}`, {
      method: "DELETE",
    });
    await parseResponse<void>(response);
  },

  update: async (id: string, data: UpdatePromptInput): Promise<Prompt> => {
    const response = await authedFetch(`/prompts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return parseResponse<Prompt>(response);
  },
};
