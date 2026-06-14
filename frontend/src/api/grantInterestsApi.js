import axiosClient from './axiosClient';

/**
 * List current user's submitted grant call interests.
 * GET /api/v1/grant-calls/my-interests
 */
export async function getMyGrantCallInterests() {
  const response = await axiosClient.get('/grant-calls/my-interests');
  return response.data;
}

/**
 * Get interest status for a specific grant call.
 * GET /api/v1/grant-calls/{callId}/my-interest
 */
export async function getMyInterestForCall(callId) {
  const response = await axiosClient.get(`/grant-calls/${callId}/my-interest`);
  return response.data;
}

/**
 * Submit interest with a PDF document.
 * POST /api/v1/grant-calls/{callId}/interests
 */
export async function submitGrantCallInterest(callId, file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosClient.post(`/grant-calls/${callId}/interests`, formData);
  return response.data;
}

/**
 * Admin: list all interest submissions for a grant call.
 * GET /api/v1/admin/grant-calls/{callId}/interests
 */
export async function getGrantCallInterestsAdmin(callId) {
  const response = await axiosClient.get(`/admin/grant-calls/${callId}/interests`);
  return response.data;
}
