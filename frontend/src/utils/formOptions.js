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

export const attachmentTypeOptions = [
  { value: 'main_proposal', label: 'Main Proposal Document', required: true },
  { value: 'budget', label: 'Budget', required: true },
  { value: 'work_plan', label: 'Work Plan / Gantt Chart', required: true },
  { value: 'cvs', label: 'CVs', required: true },
  { value: 'consent_forms', label: 'Consent Forms', required: true },
  { value: 'national_id', label: 'National ID / NIN', required: true },
  { value: 'confirmation_letter', label: 'Confirmation Letter', required: false },
  { value: 'faculty_letter', label: 'Faculty Letter / Faculty Support Evidence', required: false },
  { value: 'research_instruments', label: 'Research Instruments', required: false },
];
