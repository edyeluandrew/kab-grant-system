/**
 * referenceApi.js
 * 
 * API calls for dynamic dropdowns and reference data
 * Falls back to mock data if backend is unavailable
 * 
 * Backend endpoints:
 * GET /api/v1/general/faculties
 * GET /api/v1/general/departments?faculty_id={id}
 * GET /api/v1/general/settings
 */

import axiosClient from './axiosClient';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const mockFaculties = [
  { id: 1, name: 'Faculty of Science' },
  { id: 2, name: 'Faculty of Engineering' },
  { id: 3, name: 'Faculty of Health Sciences' },
  { id: 4, name: 'Faculty of Arts' },
  { id: 5, name: 'Faculty of Business' },
  { id: 6, name: 'Faculty of Computing and Informatics' },
  { id: 7, name: 'Faculty of Agriculture' },
];

const mockDepartments = {
  1: [
    { id: 101, faculty_id: 1, name: 'Department of Physics' },
    { id: 102, faculty_id: 1, name: 'Department of Chemistry' },
    { id: 103, faculty_id: 1, name: 'Department of Biology' },
  ],
  2: [
    { id: 201, faculty_id: 2, name: 'Department of Civil Engineering' },
    { id: 202, faculty_id: 2, name: 'Department of Electrical Engineering' },
    { id: 203, faculty_id: 2, name: 'Department of Mechanical Engineering' },
  ],
  3: [
    { id: 301, faculty_id: 3, name: 'Department of Medicine' },
    { id: 302, faculty_id: 3, name: 'Department of Nursing' },
    { id: 303, faculty_id: 3, name: 'Department of Public Health' },
  ],
  4: [
    { id: 401, faculty_id: 4, name: 'Department of Literature' },
    { id: 402, faculty_id: 4, name: 'Department of History' },
    { id: 403, faculty_id: 4, name: 'Department of Languages' },
  ],
  5: [
    { id: 501, faculty_id: 5, name: 'Department of Accounting' },
    { id: 502, faculty_id: 5, name: 'Department of Management' },
    { id: 503, faculty_id: 5, name: 'Department of Economics' },
  ],
  6: [
    { id: 601, faculty_id: 6, name: 'Department of Computer Science' },
    { id: 602, faculty_id: 6, name: 'Department of Information Technology' },
  ],
  7: [
    { id: 701, faculty_id: 7, name: 'Department of Crop Production' },
    { id: 702, faculty_id: 7, name: 'Department of Animal Production' },
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
  { id: 8, name: 'Biomedical Engineering' },
];

const mockInnovationSpecializations = [
  { id: 1, name: 'Information Technology' },
  { id: 2, name: 'Engineering and Manufacturing' },
  { id: 3, name: 'Agriculture and Food Technology' },
  { id: 4, name: 'Healthcare and Medical Devices' },
  { id: 5, name: 'Energy and Environmental Solutions' },
  { id: 6, name: 'Business and Financial Services' },
  { id: 7, name: 'Education and Training' },
];

const mockGrantCalls = [
  { id: 1, title: 'Innovation Grant 2024', status: 'active', deadline: '2024-12-31' },
  { id: 2, title: 'Research Excellence 2024', status: 'active', deadline: '2024-11-30' },
  { id: 3, title: 'Capacity Building Initiative', status: 'active', deadline: '2024-10-31' },
  { id: 4, title: 'Ecosystem Enhancement Fund', status: 'closed', deadline: '2024-09-30' },
];

export async function getFaculties() {
  try {
    const response = await axiosClient.get('/general/faculties');
    return response.data.map((f) => ({
      id: f.id,
      label: f.name,
      value: f.id,
    }));
  } catch (error) {
    console.warn('Using mock faculties (API unavailable)', error.message);
    await delay();
    return mockFaculties.map((f) => ({
      id: f.id,
      label: f.name,
      value: f.id,
    }));
  }
}

export async function getDepartments(facultyId) {
  try {
    const response = await axiosClient.get('/general/departments', {
      params: { faculty_id: facultyId }
    });
    return response.data.map((d) => ({
      id: d.id,
      label: d.name,
      value: d.id,
    }));
  } catch (error) {
    console.warn('Using mock departments (API unavailable)', error.message);
    await delay();
    const departments = mockDepartments[facultyId] || [];
    return departments.map((d) => ({
      id: d.id,
      label: d.name,
      value: d.id,
    }));
  }
}

export async function getResearchDisciplines() {
  try {
    throw new Error('Not implemented on backend yet');
  } catch (error) {
    console.warn('Using mock research disciplines', error.message);
    await delay();
    return mockResearchDisciplines.map((d) => ({
      id: d.id,
      label: d.name,
      value: d.id,
    }));
  }
}

export async function getInnovationSpecializations() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        mockInnovationSpecializations.map((s) => ({
          id: s.id,
          label: s.name,
          value: s.id,
        }))
      );
    }, 300);
  });
}

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

export async function getSystemSettings() {
  try {
    const response = await axiosClient.get('/general/settings');
    return response.data;
  } catch (error) {
    console.warn('Using mock system settings (API unavailable)', error.message);
    await delay();
    return {
      id: 1,
      system_name: 'KAB Fund for Innovation and Research (KAB-FIR)',
      active_academic_year: 2026,
      submission_deadline: '2026-12-31',
      is_accepting_applications: true,
    };
  }
}