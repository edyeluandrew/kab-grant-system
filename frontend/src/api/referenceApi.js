import axiosClient from './axiosClient';
import { getOpenGrantCallsForProposalForm } from './grantCallsApi';

// ─── Faculties ────────────────────────────────────────────────────────────────

/**
 * Get all active faculties.
 * GET /api/v1/general/faculties
 * Returns array of: { id, name }
 * Used for: Registration form dropdown
 */
export async function getFaculties() {
  const response = await axiosClient.get('/general/faculties');
  return response.data.map((f) => ({
    id: f.id,
    label: f.name,
    value: f.id,
  }));
}

// ─── Departments ──────────────────────────────────────────────────────────────

/**
 * Get departments, optionally filtered by faculty.
 * GET /api/v1/general/departments?faculty_id={id}
 * Returns array of: { id, name, faculty_id }
 * Used for: Registration/Proposal forms - dynamically load by faculty
 */
export async function getDepartments(facultyId) {
  const response = await axiosClient.get('/general/departments', {
    params: facultyId ? { faculty_id: facultyId } : {},
  });
  return response.data.map((d) => ({
    id: d.id,
    label: d.name,
    value: d.id,
    faculty_id: d.faculty_id,
  }));
}

// ─── System Settings ──────────────────────────────────────────────────────────

/**
 * Get current system settings.
 * GET /api/v1/general/settings
 * Returns: { id, system_name, system_motto, address, email, phone,
 *            active_academic_year, submission_deadline, is_accepting_applications }
 * Used for: Display settings, check if applications are open
 */
export async function getSystemSettings() {
  const response = await axiosClient.get('/general/settings');
  return response.data;
}

// ─── Research Disciplines ─────────────────────────────────────────────────────

/**
 * Research disciplines for proposal forms
 * Static options not exposed by backend API
 */
export async function getResearchDisciplines() {
  return [
    { id: 1, label: 'Engineering', value: 'engineering' },
    { id: 2, label: 'Natural Sciences', value: 'natural_sciences' },
    { id: 3, label: 'Social Sciences', value: 'social_sciences' },
    { id: 4, label: 'Medical Sciences', value: 'medical_sciences' },
    { id: 5, label: 'Agriculture', value: 'agriculture' },
    { id: 6, label: 'Technology & ICT', value: 'technology_ict' },
    { id: 7, label: 'Business & Economics', value: 'business_economics' },
    { id: 8, label: 'Other', value: 'other' },
  ];
}

// ─── Innovation Specializations ───────────────────────────────────────────────

/**
 * Innovation specializations for proposal forms
 * Static options not exposed by backend API
 */
export async function getInnovationSpecializations() {
  return [
    { id: 1, label: 'Software & Apps', value: 'software_apps' },
    { id: 2, label: 'Hardware & Devices', value: 'hardware_devices' },
    { id: 3, label: 'Agricultural Innovation', value: 'agricultural_innovation' },
    { id: 4, label: 'Healthcare Solutions', value: 'healthcare_solutions' },
    { id: 5, label: 'Clean Energy', value: 'clean_energy' },
    { id: 6, label: 'Business Model', value: 'business_model' },
    { id: 7, label: 'Environmental Solutions', value: 'environmental_solutions' },
    { id: 8, label: 'Other', value: 'other' },
  ];
}

// ─── Grant Calls ──────────────────────────────────────────────────────────────

/**
 * Get open grant calls for proposal form dropdowns.
 * Uses the same fetch path as the landing page (token + cache fallback).
 * @param {string|null} grantType - Optional client-side filter: "Research" | "Innovation"
 */
export async function getGrantCalls(grantType = null) {
  return getOpenGrantCallsForProposalForm(grantType);
}