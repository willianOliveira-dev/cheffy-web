export function buildAuthRedirectURL() {
  const frontendURL = process.env.NEXT_PUBLIC_FRONTEND_URL;

  if (typeof window === "undefined") {
    return frontendURL ?? "/";
  }

  const baseURL = frontendURL || window.location.origin;

  try {
    const url = new URL(baseURL);

    url.pathname = window.location.pathname;
    url.search = window.location.search;
    url.hash = window.location.hash;

    return url.toString();
  } catch {
    return window.location.href;
  }
}
