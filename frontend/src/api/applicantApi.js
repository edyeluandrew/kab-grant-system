import axiosClient from './axiosClient';
import { normalizeProposalPayload, mapTeamMemberFormToApi } from '../utils/proposalMapper';
import { buildAttachmentChecklist } from '../utils/attachmentUtils';
import { attachmentTypeOptions } from '../utils/formOptions';

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * Get applicant dashboard statistics (not in official API - custom endpoint for UI).
 * GET /api/v1/proposals/my (alternatively get stats from list)
 * Returns proposal summary for logged-in user
 */
export const getApplicantDashboard = async () => {
  try {
    // Get user's proposals to calculate stats
    const proposals = await getMyProposals();
    const stats = {
      totalProposals: proposals.length,
      draft: proposals.filter((p) => p.status === 'Draft').length,
      submitted: proposals.filter((p) => p.status === 'Submitted').length,
      underReview: proposals.filter((p) => p.status === 'Scheduled for Review' || p.status === 'Reviewed').length,
      approved: proposals.filter((p) => p.status === 'Approved').length,
      rejected: proposals.filter((p) => p.status === 'Rejected').length,
      awarded: proposals.filter((p) => p.status === 'Awarded').length,
    };
    return {
      proposals: proposals.slice(0, 5),
      stats,
    };
  } catch (error) {
    console.error('Failed to fetch applicant dashboard:', error);
    throw error;
  }
};

// ─── Grant Calls (Available for Applicants) ───────────────────────────────────

/**
 * Get all available grant calls (applicants see only open calls).
 * GET /api/v1/admin/grant-calls
 * Returns array of grant calls with title, description, deadline, etc.
 */
export const getAvailableGrantCalls = async () => {
  const { getOpenGrantCallsForLanding } = await import('./grantCallsApi');
  return getOpenGrantCallsForLanding();
};

/**
 * Get details of a specific grant call.
 * GET /api/v1/admin/grant-calls/{call_id}
 * Returns full grant call object with all details
 */
export const getGrantCallDetails = async (callId) => {
  const response = await axiosClient.get(`/admin/grant-calls/${callId}`);
  return response.data;
};

// ─── My Proposals ─────────────────────────────────────────────────────────────

/**
 * Get all proposals created by logged-in staff member.
 * GET /api/v1/proposals/my
 * Returns array of proposal summary objects
 */
export const getMyProposals = async () => {
  const response = await axiosClient.get('/proposals/my');
  return response.data;
};

/**
 * Get full details of a single proposal (only own proposals for staff).
 * GET /api/v1/proposals/{proposal_id}
 * Returns full proposal object with all fields
 */
export const getProposalDetails = async (proposalId) => {
  const response = await axiosClient.get(`/proposals/${proposalId}`);
  return response.data;
};

// ─── Create & Update Proposals ────────────────────────────────────────────────

/**
 * Create a new proposal (draft).
 * POST /api/v1/proposals
 * Body: Full proposal object (see schema)
 * Returns created proposal with id, protocol_no, status=Draft
 */
export const createProposalDraft = async (payload, mapperOptions = {}) => {
  const apiPayload = normalizeProposalPayload(payload, mapperOptions);
  const response = await axiosClient.post('/proposals', apiPayload);
  return response.data;
};

/**
 * Update a draft proposal.
 * PATCH /api/v1/proposals/{proposal_id}
 * Body: Proposal fields to update (partial update)
 * Returns updated proposal object
 */
export const updateProposal = async (proposalId, payload, mapperOptions = {}) => {
  const apiPayload = normalizeProposalPayload(payload, mapperOptions);
  const response = await axiosClient.patch(`/proposals/${proposalId}`, apiPayload);
  return response.data;
};

/**
 * @deprecated Use updateProposal instead
 */
export const updateProposalDraft = updateProposal;

/**
 * Delete a draft proposal.
 * DELETE /api/v1/proposals/{proposal_id}
 * Only draft proposals can be deleted
 * Returns: { message }
 */
export const deleteDraft = async (proposalId) => {
  const response = await axiosClient.delete(`/proposals/${proposalId}`);
  return response.data;
};

// ─── Attachments ──────────────────────────────────────────────────────────────

/**
 * Get all attachments for a proposal.
 * GET /api/v1/proposals/{proposal_id}
 * Attachments array included in main proposal response
 */
export const getProposalAttachments = async (proposalId) => {
  const proposal = await getProposalDetails(proposalId);
  return buildAttachmentChecklist(proposal.attachments || []);
};

export const getRawProposalAttachments = async (proposalId) => {
  const proposal = await getProposalDetails(proposalId);
  return proposal.attachments || [];
};

/**
 * Upload a supporting document for a proposal.
 * POST /api/v1/proposals/{proposal_id}/attachments
 * Body (multipart/form-data): { attachment_type, file }
 * attachment_type: "Gantt Chart"|"Budget"|"National ID"|"Confirmation Letter"|"CVs"|
 *                  "Consent Forms"|"Research Instruments"|"Faculty Support Evidence"|"Full Proposal Document"
 * Returns: { id, attachment_type, file_name, cloudinary_url, uploaded_at }
 */
export const uploadProposalAttachment = async (proposalId, attachmentType, file) => {
  const formData = new FormData();
  formData.append('attachment_type', attachmentType);
  formData.append('file', file);

  const response = await axiosClient.post(`/proposals/${proposalId}/attachments`, formData);
  return response.data;
};

/** All attachment types required by backend for auto-submission. */
export const REQUIRED_ATTACHMENT_TYPES = attachmentTypeOptions.map((o) => o.value);

// ─── Team Members ─────────────────────────────────────────────────────────────

/**
 * Get all team members for a proposal.
 * GET /api/v1/proposals/{proposal_id}
 * Team members array included in main proposal response
 */
export const getProjectTeamMembers = async (proposalId) => {
  const proposal = await getProposalDetails(proposalId);
  return proposal.team_members || [];
};

/**
 * Add a project team member to a proposal.
 * POST /api/v1/proposals/{proposal_id}/team-members
 * Body: { first_name, last_name, qualification, gender, designation, faculty_id,
 *         department, specialization, email, phone }
 * Returns: { id, first_name, last_name, qualification, gender, designation,
 *            email, phone, created_at }
 */
export const addProjectTeamMember = async (proposalId, payload, mapperOptions = {}) => {
  const apiPayload = payload.first_name
    ? payload
    : mapTeamMemberFormToApi(payload, mapperOptions);
  const response = await axiosClient.post(`/proposals/${proposalId}/team-members`, apiPayload);
  return response.data;
};

/**
 * Remove a team member from a proposal.
 * DELETE /api/v1/proposals/{proposal_id}/team-members/{member_id}
 * Returns: { message }
 */
export const deleteProjectTeamMember = async (proposalId, memberId) => {
  const response = await axiosClient.delete(`/proposals/${proposalId}/team-members/${memberId}`);
  return response.data;
};

// ─── Notifications ────────────────────────────────────────────────────────────

/**
 * Get notifications for applicant (not in official API - custom endpoint).
 * This is a derived concept - notifications might come from proposal status changes
 */
export const getApplicantNotifications = async () => {
  try {
    const proposals = await getMyProposals();
    // Map proposal status changes to notifications
    return proposals.map((p) => ({
      id: p.id,
      type: 'proposal_status_change',
      title: `Proposal: ${p.title}`,
      message: `Status: ${p.status}`,
      timestamp: p.submitted_at || p.created_at,
    }));
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
};
