/** Backend ProposalStatus enum values (Title Case with spaces). */
export const PROPOSAL_STATUS = {
  DRAFT: 'Draft',
  MISSING_ATTACHMENTS: 'Missing Attachments',
  SUBMITTED: 'Submitted',
  SCHEDULED: 'Scheduled for Review',
  REVIEWED: 'Reviewed',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  AWARDED: 'Awarded',
};

export function normalizeStatusKey(status) {
  if (!status) return '';
  return String(status).toLowerCase().replace(/\s+/g, '_');
}

export function isDraftLike(status) {
  const key = normalizeStatusKey(status);
  return key === 'draft' || key === 'missing_attachments';
}

export function isEditable(status) {
  return isDraftLike(status);
}

export function canUploadDocuments(status) {
  return isDraftLike(status);
}

const STATUS_LABELS = {
  draft: 'Draft',
  missing_attachments: 'Missing Attachments',
  submitted: 'Submitted',
  scheduled_for_review: 'Scheduled for Review',
  reviewed: 'Reviewed',
  approved: 'Approved',
  rejected: 'Rejected',
  awarded: 'Awarded',
};

const STATUS_VARIANTS = {
  draft: 'warning',
  missing_attachments: 'warning',
  submitted: 'info',
  scheduled_for_review: 'info',
  reviewed: 'info',
  approved: 'success',
  rejected: 'danger',
  awarded: 'success',
};

export function getStatusLabel(status) {
  return STATUS_LABELS[normalizeStatusKey(status)] || status || 'Unknown';
}

export function getStatusVariant(status) {
  return STATUS_VARIANTS[normalizeStatusKey(status)] || 'default';
}
