import { buildAttachmentChecklist, countUploadedRequired } from './attachmentUtils';

export function getProtocolNo(proposal) {
  return proposal?.protocol_no || proposal?.protocolNo || '—';
}

export function getGrantType(proposal) {
  const type = proposal?.grant_type || proposal?.proposal_type || '';
  if (!type) return '';
  const lower = String(type).toLowerCase();
  if (lower === 'research') return 'Research';
  if (lower === 'innovation') return 'Innovation';
  return type;
}

export function isResearchProposal(proposal) {
  return getGrantType(proposal) === 'Research';
}

export function getTeamMemberCount(proposal) {
  return proposal?.team_members?.length ?? proposal?.membersCount ?? 0;
}

export function getAttachmentSummary(proposal) {
  const checklist = buildAttachmentChecklist(proposal?.attachments || []);
  const { uploaded, total } = countUploadedRequired(checklist);
  return { checklist, uploaded, total, missing: total - uploaded };
}

export function getEditPath(proposal) {
  const base = `/applicant/proposals/${proposal.id}/edit`;
  return isResearchProposal(proposal) ? `${base}/research` : `${base}/innovation`;
}

export function buildTimelineFromStatusHistory(proposal) {
  const history = proposal?.status_history || [];
  const findDate = (...statuses) => {
    const entry = history.find((h) => statuses.includes(h.new_status));
    return entry?.changed_at || null;
  };
  return {
    draftCreated: proposal?.created_at || findDate('Draft'),
    attachmentsUploaded: findDate('Missing Attachments', 'Submitted'),
    submitted: proposal?.submitted_at || findDate('Submitted'),
    scheduledReview: findDate('Scheduled for Review'),
    reviewed: findDate('Reviewed'),
    decision: findDate('Approved', 'Rejected', 'Awarded'),
  };
}
