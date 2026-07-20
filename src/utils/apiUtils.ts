export const API_URL = "http://localhost:8080";

export function applyUrlParams(url: string, urlParams: string[]): string {
  let i = 0
  return url.replace(/:([^/]+)/g, () => urlParams[i++] ?? '')
}

export function createApiUrl(endpoint: string, params: Record<string, string> = {}): string {
  return API_URL + "/"
    + endpoint + "?"
    + new URLSearchParams(params).toString();
}