import axiosClient from './axiosClient';

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * Get admin dashboard statistics.
 * GET /api/v1/admin/dashboard
 * Returns: { submitted, scheduled_for_review, reviewed, approved, rejected, awarded, total }
 */
export const getDashboardStats = async () => {
  const response = await axiosClient.get('/admin/dashboard');
  return response.data;
};

// ─── Users ────────────────────────────────────────────────────────────────────

/**
 * List all users.
 * GET /api/v1/admin/users
 */
export const getUsers = async () => {
  const response = await axiosClient.get('/admin/users');
  return response.data;
};

/**
 * Deactivate a user.
 * PATCH /api/v1/admin/users/{user_id}/deactivate
 */
export const deactivateUser = async (userId) => {
  const response = await axiosClient.patch(`/admin/users/${userId}/deactivate`);
  return response.data;
};

/**
 * Activate a user.
 * PATCH /api/v1/admin/users/{user_id}/activate
 */
export const activateUser = async (userId) => {
  const response = await axiosClient.patch(`/admin/users/${userId}/activate`);
  return response.data;
};

// ─── Reviewers ────────────────────────────────────────────────────────────────

/**
 * List all reviewers.
 * GET /api/v1/admin/reviewers
 * Returns array of: { id, user_id, research_discipline, created_at, user: { ...full user object } }
 */
export const getReviewers = async () => {
  const response = await axiosClient.get('/admin/reviewers');
  return response.data;
};

/**
 * Create a new reviewer.
 * POST /api/v1/admin/reviewers
 * Body: { first_name, surname, gender, phone, research_discipline, email, password, confirm_password }
 * Returns: { id, user_id, research_discipline, created_at, user }
 */
export const createReviewer = async (payload) => {
  const response = await axiosClient.post('/admin/reviewers', {
    first_name: payload.first_name,
    surname: payload.surname,
    gender: payload.gender,
    phone: payload.phone || null,
    research_discipline: payload.research_discipline || null,
    email: payload.email,
    password: payload.password,
    confirm_password: payload.confirm_password,
  });
  return response.data;
};

/**
 * Delete a reviewer.
 * DELETE /api/v1/admin/reviewers/{reviewer_id}
 */
export const deleteReviewer = async (reviewerId) => {
  const response = await axiosClient.delete(`/admin/reviewers/${reviewerId}`);
  return response.data;
};

// ─── Proposals by Status ───────────────────────────────────────────────────────

/**
 * Get all submitted proposals.
 * GET /api/v1/admin/proposals/submitted
 */
export const getSubmittedProposals = async () => {
  const response = await axiosClient.get('/admin/proposals/submitted');
  return response.data;
};

/**
 * Get all proposals scheduled for review.
 * GET /api/v1/admin/proposals/scheduled
 */
export const getScheduledProposals = async () => {
  const response = await axiosClient.get('/admin/proposals/scheduled');
  return response.data;
};

/**
 * Get all reviewed proposals.
 * GET /api/v1/admin/proposals/reviewed
 */
export const getReviewedProposals = async () => {
  const response = await axiosClient.get('/admin/proposals/reviewed');
  return response.data;
};

/**
 * Get all approved proposals.
 * GET /api/v1/admin/proposals/approved
 */
export const getApprovedProposals = async () => {
  const response = await axiosClient.get('/admin/proposals/approved');
  return response.data;
};

/**
 * Get all rejected proposals.
 * GET /api/v1/admin/proposals/rejected
 */
export const getRejectedProposals = async () => {
  const response = await axiosClient.get('/admin/proposals/rejected');
  return response.data;
};

/**
 * Get all awarded proposals.
 * GET /api/v1/admin/proposals/awarded
 */
export const getAwardedProposals = async () => {
  const response = await axiosClient.get('/admin/proposals/awarded');
  return response.data;
};

// ─── Proposal Management ───────────────────────────────────────────────────────

/**
 * Get full proposal details.
 * GET /api/v1/admin/proposals/{proposal_id}
 */
export const getProposalDetail = async (proposalId) => {
  const response = await axiosClient.get(`/admin/proposals/${proposalId}`);
  return response.data;
};

/**
 * Assign reviewers to a proposal.
 * POST /api/v1/admin/proposals/{proposal_id}/assign-reviewers
 * Body: { reviewer_ids: [id1, id2, ...] }  // 1-3 reviewers
 * Returns: { message }
 */
export const assignReviewers = async (proposalId, reviewerIds) => {
  const response = await axiosClient.post(`/admin/proposals/${proposalId}/assign-reviewers`, {
    reviewer_ids: reviewerIds,
  });
  return response.data;
};

/**
 * Remove a reviewer from a proposal.
 * DELETE /api/v1/admin/proposals/{proposal_id}/reviewers/{reviewer_id}
 * Returns: { message }
 */
export const removeReviewerAssignment = async (proposalId, reviewerId) => {
  const response = await axiosClient.delete(
    `/admin/proposals/${proposalId}/reviewers/${reviewerId}`
  );
  return response.data;
};

/**
 * Make a decision on a proposal.
 * POST /api/v1/admin/proposals/{proposal_id}/decision
 * Body: { decision, note }
 * Returns: { message }
 */
export const makeDecision = async (proposalId, decision, note) => {
  const response = await axiosClient.post(`/admin/proposals/${proposalId}/decision`, {
    decision,
    note: note || null,
  });
  return response.data;
};

/**
 * Set review deadline for a reviewer assignment.
 * PATCH /api/v1/admin/proposals/{proposal_id}/reviewers/{reviewer_id}/deadline
 * Body: { deadline }  // YYYY-MM-DD format
 * Returns: { message }
 */
export const setReviewDeadline = async (proposalId, reviewerId, deadline) => {
  const response = await axiosClient.patch(
    `/admin/proposals/${proposalId}/reviewers/${reviewerId}/deadline`,
    { deadline }
  );
  return response.data;
};

/**
 * Get review status for all assignments of a proposal.
 * GET /api/v1/admin/proposals/{proposal_id}/review-status
 * Returns array of: { id, proposal_id, reviewer_id, assigned_at, review_status, reviewer: {...} }
 */
export const getReviewStatus = async (proposalId) => {
  const response = await axiosClient.get(`/admin/proposals/${proposalId}/review-status`);
  return response.data;
};

// ─── Grant Calls ──────────────────────────────────────────────────────────────

/**
 * List all grant calls.
 * GET /api/v1/admin/grant-calls
 * Returns array of grant call objects
 */
export const getGrantCalls = async () => {
  const response = await axiosClient.get('/admin/grant-calls');
  return response.data;
};

/**
 * Get a single grant call by ID.
 * GET /api/v1/admin/grant-calls/{call_id}
 */
export const getGrantCall = async (callId) => {
  const response = await axiosClient.get(`/admin/grant-calls/${callId}`);
  return response.data;
};

/**
 * Create a new grant call.
 * POST /api/v1/admin/grant-calls
 * Body: { title, description, grant_type, academic_year, opening_date, closing_date, max_budget }
 * grant_type: "Research" | "Innovation"
 * dates: YYYY-MM-DD format
 */
export const createGrantCall = async (payload) => {
  const response = await axiosClient.post('/admin/grant-calls', {
    title: payload.title,
    description: payload.description || null,
    grant_type: payload.grant_type,
    academic_year: payload.academic_year,
    opening_date: payload.opening_date,
    closing_date: payload.closing_date,
    max_budget: payload.max_budget || null,
  });
  return response.data;
};

/**
 * Update an existing grant call.
 * PUT /api/v1/admin/grant-calls/{call_id}
 * Body: { title, description, opening_date, closing_date, max_budget }
 * Cannot update a Closed call
 */
export const updateGrantCall = async (callId, payload) => {
  const response = await axiosClient.put(`/admin/grant-calls/${callId}`, {
    title: payload.title || null,
    description: payload.description || null,
    opening_date: payload.opening_date || null,
    closing_date: payload.closing_date || null,
    max_budget: payload.max_budget || null,
  });
  return response.data;
};

/**
 * Delete a grant call.
 * DELETE /api/v1/admin/grant-calls/{call_id}
 * Only Draft calls can be deleted — Open and Closed calls must be closed first
 */
export const deleteGrantCall = async (callId) => {
  const response = await axiosClient.delete(`/admin/grant-calls/${callId}`);
  return response.data;
};

/**
 * Open the application window for a grant call.
 * POST /api/v1/admin/grant-calls/{call_id}/open-window
 * Sets status to Open. Can only be done from Draft status
 */
export const openApplicationWindow = async (callId) => {
  const response = await axiosClient.post(`/admin/grant-calls/${callId}/open-window`);
  return response.data;
};

/**
 * Close the application window for a grant call.
 * POST /api/v1/admin/grant-calls/{call_id}/close-window
 * Sets status to Closed. Can only be done from Open status
 */
export const closeApplicationWindow = async (callId) => {
  const response = await axiosClient.post(`/admin/grant-calls/${callId}/close-window`);
  return response.data;
};

/**
 * List interest submissions for a grant call.
 * GET /api/v1/admin/grant-calls/{call_id}/interests
 */
export const getGrantCallInterests = async (callId) => {
  const response = await axiosClient.get(`/admin/grant-calls/${callId}/interests`);
  return response.data;
};

// ─── DEPRECATED ALIASES (kept for backward compatibility) ─────────────────────

/**
 * @deprecated Use getDashboardStats instead
 */
export const getAdminDashboard = getDashboardStats;

/**
 * @deprecated Use getProposalDetail instead
 */
export const getAdminProposalDetail = getProposalDetail;

/**
 * @deprecated Use removeReviewerAssignment instead
 */
export const removeReviewerFromProposal = removeReviewerAssignment;

/**
 * @deprecated Use deleteReviewer instead
 */
export const removeReviewer = deleteReviewer;

