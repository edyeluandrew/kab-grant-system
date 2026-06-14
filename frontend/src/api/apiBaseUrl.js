/** Ensure API base always ends with /api/v1 */
export function resolveApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE_URL || 'https://kab-grant-system.onrender.com/api/v1';
  const trimmed = String(raw).replace(/\/+$/, '');
  if (trimmed.endsWith('/api/v1')) return trimmed;
  if (trimmed.endsWith('/api')) return `${trimmed}/v1`;
  return `${trimmed}/api/v1`;
}
