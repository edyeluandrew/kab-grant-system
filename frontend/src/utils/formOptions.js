/**
 * Static form option arrays for KAB Grant System
 * These are referenced across applicant pages for consistent dropdown values
 */

export const sexOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const qualificationOptions = [
  { value: 'phd', label: 'PhD' },
  { value: 'masters', label: 'Masters Degree' },
  { value: 'bachelors', label: 'Bachelors Degree' },
  { value: 'others', label: 'Others' },
];

export const designationOptions = [
  { value: 'professor', label: 'Professor' },
  { value: 'assoc_professor', label: 'Assoc. Professor' },
  { value: 'snr_lecturer', label: 'Snr. Lecturer' },
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'teaching_assistant', label: 'Teaching Assistant' },
  { value: 'assistant_lecturer', label: 'Assistant Lecturer' },
  { value: 'snr_administrator', label: 'Snr. Administrator' },
  { value: 'administrator', label: 'Administrator' },
  { value: 'assistant_administrator', label: 'Assistant Administrator' },
  { value: 'others', label: 'Others' },
];

export const typeOfResearchOptions = [
  { value: 'research_based', label: 'Research Based' },
  { value: 'innovation_based', label: 'Innovation Based' },
  { value: 'ecosystem_enhancement', label: 'Ecosystem Enhancement' },
  { value: 'capacity_building', label: 'Capacity Building' },
  { value: 'other', label: 'Other' },
];

export const typeOfInnovationOptions = [
  { value: 'new_product', label: 'New Product' },
  { value: 'new_service', label: 'New Service' },
  { value: 'new_process', label: 'New Process' },
  { value: 'new_technology', label: 'New Technology' },
  { value: 'new_business_model', label: 'New Business Model' },
  { value: 'other', label: 'Other' },
];

export const proposalStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'missing_attachments', label: 'Missing Attachments' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'scheduled_for_review', label: 'Scheduled for Review' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'awarded', label: 'Awarded' },
];

/**
 * Must match backend AttachmentType enum values exactly (all 9 required for auto-submit).
 */
export const attachmentTypeOptions = [
  { value: 'Gantt Chart', label: 'Gantt Chart / Work Plan', required: true },
  { value: 'Budget', label: 'Budget', required: true },
  { value: 'National ID', label: 'National ID / NIN', required: true },
  { value: 'Confirmation Letter', label: 'Confirmation Letter', required: true },
  { value: 'CVs', label: 'Team CVs', required: true },
  { value: 'Consent Forms', label: 'Consent Forms', required: true },
  { value: 'Research Instruments', label: 'Research Instruments', required: true },
  { value: 'Faculty Support Evidence', label: 'Faculty Support Evidence', required: true },
  { value: 'Full Proposal Document', label: 'Full Proposal Document', required: true },
];
