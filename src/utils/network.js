export function getQueryString(params) {
  const urlParams = new URLSearchParams();
  const entries = Object.entries(params);

  for (const [key] of entries) {
    urlParams.append(key, params[key]);
  }
  return urlParams.toString();
}
