import axiosClient from './axiosClient';
import {
  getSubmittedProposalIds,
  markProposalReviewSubmitted,
  saveReviewSnapshot,
  pushReviewMeta,
} from '../utils/reviewerUtils';

// ─── Assigned Proposals ────────────────────────────────────────────────────────

/**
 * Get all proposals assigned to the logged-in reviewer.
 * GET /api/v1/reviewer/proposals
 * Returns array of full proposal details with all fields
 */
export const getAssignedProposals = async () => {
  const response = await axiosClient.get('/reviewer/proposals');
  const submittedIds = new Set(getSubmittedProposalIds());
  return (response.data || []).map((p) => ({
    ...p,
    review_submitted: submittedIds.has(p.id),
  }));
};

/**
 * Get full details of a single assigned proposal.
 * GET /api/v1/reviewer/proposals/{proposal_id}
 */
export const getAssignedProposalDetail = async (proposalId) => {
  const response = await axiosClient.get(`/reviewer/proposals/${proposalId}`);
  const submittedIds = new Set(getSubmittedProposalIds());
  return {
    ...response.data,
    review_submitted: submittedIds.has(Number(proposalId)),
  };
};

// ─── Review Submission ────────────────────────────────────────────────────────

/**
 * Submit a review report for an assigned proposal.
 * POST /api/v1/reviewer/proposals/{proposal_id}/review
 * Body (multipart/form-data):
 *   - recommendation: "Approve" | "Minor Revisions" | "Major Revisions" | "Reject" (required)
 *   - score: integer (optional)
 *   - comments: string (optional)
 *   - report_file: File (optional)
 * Returns: { id, recommendation, score, comments, report_file_url, submitted_at }
 */
export const submitReview = async (proposalId, payload) => {
  const formData = new FormData();
  formData.append('recommendation', payload.recommendation);
  
  if (payload.score !== undefined && payload.score !== null) {
    formData.append('score', payload.score);
  }
  if (payload.comments) {
    formData.append('comments', payload.comments);
  }
  if (payload.report_file) {
    formData.append('report_file', payload.report_file);
  }

  const response = await axiosClient.post(`/reviewer/proposals/${proposalId}/review`, formData);
  markProposalReviewSubmitted(proposalId);
  return response.data;
};

/** Persist proposal metadata for submitted reviews list (API omits proposal_id). */
export const cacheProposalForReview = (proposalId, snapshot) => {
  saveReviewSnapshot(proposalId, snapshot);
  pushReviewMeta(snapshot);
};

// ─── My Reviews ───────────────────────────────────────────────────────────────

/**
 * Get all reviews submitted by the logged-in reviewer.
 * GET /api/v1/reviewer/my-reviews
 * Returns array of: { id, recommendation, score, comments, report_file_url, submitted_at }
 */
export const getMyReviews = async () => {
  const response = await axiosClient.get('/reviewer/my-reviews');
  return response.data;
};

// ─── Dashboard Stats (Derived) ────────────────────────────────────────────────

/**
 * Get reviewer dashboard statistics (derived from multiple endpoints).
 * No single endpoint exists - stats are computed from:
 * - getAssignedProposals() - total assigned and pending review
 * - getMyReviews() - submitted reviews count
 * Returns: { total_assigned, pending_review, submitted_reviews }
 */
export const getReviewerDashboardStats = async () => {
  try {
    const [assignedResponse, submittedReviews] = await Promise.all([
      axiosClient.get('/reviewer/proposals'),
      getMyReviews(),
    ]);

    const assignedProposals = assignedResponse.data || [];
    const submittedCount = submittedReviews?.length || 0;
    const totalAssigned = assignedProposals.length;
    const pendingCount = Math.max(0, totalAssigned - submittedCount);

    return {
      total_assigned: totalAssigned,
      pending_review: pendingCount,
      submitted_reviews: submittedCount,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw error;
  }
};

// ─── DEPRECATED ALIASES (kept for backward compatibility) ──────────────────────

/**
 * @deprecated Use getMyReviews instead
 */
export const getSubmittedReviews = getMyReviews;

