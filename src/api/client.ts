const DEFAULT_REVALIDATE_SECONDS = 300;

export function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "";
  }

  return process.env.NEXT_PUBLIC_API_BASE_URL || "";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { revalidate?: number } = {},
): Promise<T | null> {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  const url = `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
      next:
        typeof window === "undefined"
          ? { revalidate: options.revalidate ?? DEFAULT_REVALIDATE_SECONDS }
          : undefined,
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}
