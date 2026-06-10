/** Flatten nested reviewer API shape `{ id, user: { first_name, ... } }`. */
export function normalizeReviewer(row) {
  if (!row) return row;
  const u = row.user || {};
  return {
    ...row,
    id: row.id,
    first_name: row.first_name || u.first_name || '',
    surname: row.surname || u.surname || '',
    email: row.email || u.email || '',
    phone: row.phone || u.phone || '',
    research_discipline: row.research_discipline || '',
  };
}

export function normalizeReviewers(rows = []) {
  return rows.map(normalizeReviewer);
}

const SUBMITTED_KEY = 'kab_reviewer_submitted_proposals';
const SNAPSHOT_KEY = 'kab_reviewer_review_snapshots';
const META_LIST_KEY = 'kab_reviewer_review_meta_list';

export function getSubmittedProposalIds() {
  try {
    return JSON.parse(localStorage.getItem(SUBMITTED_KEY) || '[]');
  } catch {
    return [];
  }
}

export function markProposalReviewSubmitted(proposalId) {
  const id = Number(proposalId);
  const ids = getSubmittedProposalIds();
  if (!ids.includes(id)) {
    localStorage.setItem(SUBMITTED_KEY, JSON.stringify([...ids, id]));
  }
}

export function saveReviewSnapshot(proposalId, snapshot) {
  try {
    const all = JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || '{}');
    all[String(proposalId)] = snapshot;
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

export function getReviewSnapshots() {
  try {
    return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || '{}');
  } catch {
    return {};
  }
}

/** Ordered proposal metadata for my-reviews (API has no proposal_id). */
export function pushReviewMeta(meta) {
  try {
    const list = JSON.parse(localStorage.getItem(META_LIST_KEY) || '[]');
    list.unshift(meta);
    localStorage.setItem(META_LIST_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function getReviewMetaList() {
  try {
    return JSON.parse(localStorage.getItem(META_LIST_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Map review-status API rows to UI reviewer chips. */
export function mapReviewStatusAssignments(assignments = []) {
  return assignments.map((a) => {
    const reviewer = normalizeReviewer(a.reviewer || {});
    const submitted = a.review_status === 'Submitted';
    return {
      id: a.reviewer_id,
      assignment_id: a.id,
      first_name: reviewer.first_name,
      surname: reviewer.surname,
      name: `${reviewer.first_name} ${reviewer.surname}`.trim(),
      review_deadline: a.deadline || null,
      submitted_review: submitted,
      review_status: a.review_status,
    };
  });
}
