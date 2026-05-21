/**
 * referenceApi.js
 * 
 * API-ready mock functions for dynamic dropdowns and reference data
 * These functions are structured to easily replace with Django REST API calls later
 * 
 * Future endpoints:
 * GET /api/faculties/
 * GET /api/departments/
 * GET /api/research-disciplines/
 * GET /api/grant-calls/
 */

// Mock data - will be replaced by API calls
const mockFaculties = [
  { id: 1, name: 'Faculty of Science' },
  { id: 2, name: 'Faculty of Engineering' },
  { id: 3, name: 'Faculty of Health Sciences' },
  { id: 4, name: 'Faculty of Arts' },
  { id: 5, name: 'Faculty of Business' },
];

const mockDepartments = {
  1: [
    { id: 101, facultyId: 1, name: 'Department of Physics' },
    { id: 102, facultyId: 1, name: 'Department of Chemistry' },
    { id: 103, facultyId: 1, name: 'Department of Biology' },
  ],
  2: [
    { id: 201, facultyId: 2, name: 'Department of Civil Engineering' },
    { id: 202, facultyId: 2, name: 'Department of Electrical Engineering' },
    { id: 203, facultyId: 2, name: 'Department of Mechanical Engineering' },
  ],
  3: [
    { id: 301, facultyId: 3, name: 'Department of Medicine' },
    { id: 302, facultyId: 3, name: 'Department of Nursing' },
    { id: 303, facultyId: 3, name: 'Department of Public Health' },
  ],
  4: [
    { id: 401, facultyId: 4, name: 'Department of Literature' },
    { id: 402, facultyId: 4, name: 'Department of History' },
    { id: 403, facultyId: 4, name: 'Department of Languages' },
  ],
  5: [
    { id: 501, facultyId: 5, name: 'Department of Accounting' },
    { id: 502, facultyId: 5, name: 'Department of Management' },
    { id: 503, facultyId: 5, name: 'Department of Economics' },
  ],
};

const mockResearchDisciplines = [
  { id: 1, name: 'Natural Sciences' },
  { id: 2, name: 'Engineering and Technology' },
  { id: 3, name: 'Medical and Health Sciences' },
  { id: 4, name: 'Agricultural Sciences' },
  { id: 5, name: 'Social Sciences' },
  { id: 6, name: 'Humanities' },
  { id: 7, name: 'Information Technology' },
];

const mockGrantCalls = [
  { id: 1, title: 'Innovation Grant 2024', status: 'active', deadline: '2024-12-31' },
  { id: 2, title: 'Research Excellence 2024', status: 'active', deadline: '2024-11-30' },
  { id: 3, title: 'Capacity Building Initiative', status: 'active', deadline: '2024-10-31' },
  { id: 4, title: 'Ecosystem Enhancement Fund', status: 'closed', deadline: '2024-09-30' },
];

/**
 * Get all faculties
 * @returns {Promise<Array>} Array of faculty objects
 * 
 * Future: Replace with axios.get('/api/faculties/')
 */
export async function getFaculties() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        mockFaculties.map((f) => ({
          id: f.id,
          label: f.name,
          value: f.id,
        }))
      );
    }, 300);
  });
}

/**
 * Get departments by faculty ID
 * @param {number} facultyId - Faculty ID to filter departments
 * @returns {Promise<Array>} Array of department objects
 * 
 * Future: Replace with axios.get(`/api/departments/?faculty=${facultyId}`)
 */
export async function getDepartments(facultyId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const departments = mockDepartments[facultyId] || [];
      resolve(
        departments.map((d) => ({
          id: d.id,
          label: d.name,
          value: d.id,
        }))
      );
    }, 300);
  });
}

/**
 * Get all research disciplines
 * @returns {Promise<Array>} Array of research discipline objects
 * 
 * Future: Replace with axios.get('/api/research-disciplines/')
 */
export async function getResearchDisciplines() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        mockResearchDisciplines.map((d) => ({
          id: d.id,
          label: d.name,
          value: d.id,
        }))
      );
    }, 300);
  });
}

/**
 * Get all active grant calls
 * @returns {Promise<Array>} Array of grant call objects
 * 
 * Future: Replace with axios.get('/api/grant-calls/?status=active')
 */
export async function getGrantCalls() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        mockGrantCalls
          .filter((g) => g.status === 'active')
          .map((g) => ({
            id: g.id,
            label: g.title,
            value: g.id,
            deadline: g.deadline,
          }))
      );
    }, 300);
  });
}
