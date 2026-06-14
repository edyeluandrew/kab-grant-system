import axiosClient from './axiosClient';

// ─── Faculties ────────────────────────────────────────────────────────────────

/**
 * List all active faculties.
 * GET /api/v1/general/faculties
 * Public endpoint - no authentication required
 * Returns: Array of { id, name, is_active, created_at }
 */
export const listFaculties = async () => {
  const response = await axiosClient.get('/general/faculties');
  return response.data;
};

/**
 * Create a new faculty (admin only).
 * POST /api/v1/general/faculties
 * Body: { name }
 * Returns: { id, name, is_active, created_at }
 */
export const createFaculty = async (payload) => {
  const response = await axiosClient.post('/general/faculties', {
    name: payload.name,
  });
  return response.data;
};

/**
 * Delete a faculty (admin only).
 * DELETE /api/v1/general/faculties/{faculty_id}
 * Returns: { message }
 */
export const deleteFaculty = async (facultyId) => {
  const response = await axiosClient.delete(`/general/faculties/${facultyId}`);
  return response.data;
};

// ─── Departments ──────────────────────────────────────────────────────────────

/**
 * List all active departments (optionally filtered by faculty).
 * GET /api/v1/general/departments
 * Public endpoint - no authentication required
 * Returns: Array of { id, faculty_id, name, is_active, created_at }
 */
export const listDepartments = async () => {
  const response = await axiosClient.get('/general/departments');
  return response.data;
};

/**
 * Create a new department (admin only).
 * POST /api/v1/general/departments
 * Body: { faculty_id, name }
 * Returns: { id, faculty_id, name, is_active, created_at }
 */
export const createDepartment = async (payload) => {
  const response = await axiosClient.post('/general/departments', {
    faculty_id: payload.faculty_id,
    name: payload.name,
  });
  return response.data;
};

/**
 * Delete a department (admin only).
 * DELETE /api/v1/general/departments/{department_id}
 * Returns: { message }
 */
export const deleteDepartment = async (departmentId) => {
  const response = await axiosClient.delete(`/general/departments/${departmentId}`);
  return response.data;
};

// ─── Settings ─────────────────────────────────────────────────────────────────

/**
 * Get system settings (academic year, submission deadlines, etc).
 * GET /api/v1/general/settings
 * Public endpoint
 * Returns: { active_academic_year, submission_open, deadline_date, etc }
 * Falls back to defaults if not found.
 */
export const getSettings = async () => {
  try {
    const response = await axiosClient.get('/general/settings');
    return response.data;
  } catch (error) {
    // If settings not found (404), return defaults
    if (error.response?.status === 404) {
      return {
        system_name: 'KAB Fund for Innovation and Research (KAB-FIR)',
        system_motto: 'Supporting Innovation and Research at Kabale University',
        address: 'Kabale University, P.O. Box 317, Kabale, Uganda',
        email: 'innovation@kab.ac.ug',
        phone: '+256-486-430-033',
        active_academic_year: 2026,
        submission_deadline: '2026-12-31',
        is_accepting_applications: true,
      };
    }
    // For other errors, rethrow
    throw error;
  }
};

/**
 * Update system settings (admin only).
 * PATCH /api/v1/general/settings
 * Body: { field: value, ... }
 * Returns: Updated settings object
 */
export const updateSettings = async (payload) => {
  const response = await axiosClient.patch('/general/settings', payload);
  return response.data;
};
