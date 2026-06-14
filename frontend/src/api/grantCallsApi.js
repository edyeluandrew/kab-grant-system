const OPEN_CALLS_CACHE_KEY = 'kab_public_open_grant_calls';
const STATIC_GRANT_CALLS_PATH = '/open-grant-calls.json';

import { resolveApiBaseUrl } from './apiBaseUrl';

const API_BASE = resolveApiBaseUrl();

export function cacheOpenGrantCallsForLanding(calls) {
  const openCalls = (calls || []).filter((call) => call.status === 'Open');
  try {
    localStorage.setItem(OPEN_CALLS_CACHE_KEY, JSON.stringify(openCalls));
  } catch {
    // ignore quota errors
  }
  return openCalls;
}

export function readCachedOpenGrantCalls() {
  try {
    const raw = localStorage.getItem(OPEN_CALLS_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((call) => call.status === 'Open') : [];
  } catch {
    return [];
  }
}

/** Public endpoint — no authentication required. */
export async function fetchPublicGrantCalls() {
  const response = await fetch(`${API_BASE}/general/grant-calls`, {
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = body.detail || `Failed to load grant calls (${response.status})`;
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/**
 * Fetch grant calls from /admin/grant-calls (authenticated).
 * @param {object} options
 * @param {string|null} options.token - Bearer token to use (explicit only)
 * @param {boolean} options.useSessionFallback - Also try localStorage authToken when token omitted
 */
export async function fetchGrantCalls({ token = undefined, useSessionFallback = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  let authToken = token;
  if (authToken === undefined && useSessionFallback) {
    authToken = localStorage.getItem('authToken');
  }

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}/admin/grant-calls`, { headers });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = body.detail || `Failed to load grant calls (${response.status})`;
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

/** Public static file fallback — no authentication. */
export async function fetchStaticOpenGrantCalls() {
  try {
    const response = await fetch(STATIC_GRANT_CALLS_PATH, { cache: 'no-store' });
    if (!response.ok) return [];
    const data = await response.json();
    const list = Array.isArray(data) ? data : data?.grant_calls;
    if (!Array.isArray(list)) return [];
    const openCalls = list.filter((call) => call.status === 'Open');
    if (openCalls.length > 0) {
      cacheOpenGrantCallsForLanding(openCalls);
    }
    return openCalls;
  } catch {
    return [];
  }
}

function normalizeGrantType(type) {
  return String(type || '').trim().toLowerCase();
}

/** Map raw API grant calls to `{ value, label, id }` dropdown options. */
export function mapGrantCallsToDropdownOptions(calls, grantType = null) {
  const typeFilter = grantType ? normalizeGrantType(grantType) : null;

  return (calls || [])
    .filter((call) => call.status === 'Open')
    .filter((call) => !typeFilter || normalizeGrantType(call.grant_type) === typeFilter)
    .map((call) => ({
      ...call,
      id: call.id,
      value: String(call.id),
      title: call.title,
      label: `${call.title} (${call.grant_type || 'Grant'} · Closes: ${call.closing_date || 'TBD'})`,
      grant_type: call.grant_type,
      status: call.status,
      description: call.description,
      opening_date: call.opening_date,
      closing_date: call.closing_date,
      academic_year: call.academic_year,
      max_budget: call.max_budget,
    }));
}

/**
 * Landing & proposal forms — load open grant calls without requiring login.
 * Order: public API → static JSON → session token → cache
 */
export async function getOpenGrantCallsForLanding() {
  // 1. Public API — anonymous visitors (no account or token needed)
  try {
    const calls = await fetchPublicGrantCalls();
    return cacheOpenGrantCallsForLanding(calls);
  } catch (error) {
    console.warn('Public grant calls fetch failed:', error.message);
  }

  // 2. Static JSON bundled with the app
  const staticCalls = await fetchStaticOpenGrantCalls();
  if (staticCalls.length > 0) {
    return staticCalls;
  }

  // 3. Logged-in visitor — refresh from their session
  const sessionToken = localStorage.getItem('authToken');
  if (sessionToken) {
    try {
      const calls = await fetchGrantCalls({ token: sessionToken, useSessionFallback: false });
      return cacheOpenGrantCallsForLanding(calls);
    } catch (error) {
      console.warn('Session grant calls fetch failed:', error.message);
    }
  }

  // 4. Last resort: browser cache from a prior successful load
  const cached = readCachedOpenGrantCalls();
  if (cached.length > 0) return cached;

  return [];
}

export async function getOpenGrantCallsForProposalForm(grantType = null) {
  const rawCalls = await getOpenGrantCallsForLanding();
  const interestedCalls = await filterCallsByUserInterests(rawCalls);
  return mapGrantCallsToDropdownOptions(interestedCalls, grantType);
}

/** Only grant calls the user has expressed interest in (for proposal forms). */
export async function filterCallsByUserInterests(calls) {
  try {
    const { getMyGrantCallInterests } = await import('./grantInterestsApi');
    const interests = await getMyGrantCallInterests();
    const interestedIds = new Set(interests.map((i) => i.grant_call_id));
    return (calls || []).filter((call) => interestedIds.has(call.id));
  } catch {
    return [];
  }
}

export async function getInterestedGrantCallIds() {
  try {
    const { getMyGrantCallInterests } = await import('./grantInterestsApi');
    const interests = await getMyGrantCallInterests();
    return new Set(interests.map((i) => i.grant_call_id));
  } catch {
    return new Set();
  }
}

/** @deprecated Use getOpenGrantCallsForProposalForm */
export async function getOpenGrantCallsForDropdown(grantType = null) {
  return getOpenGrantCallsForProposalForm(grantType);
}
