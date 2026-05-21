import axiosClient from './axiosClient';

// Mock data
const mockProposals = [
  {
    id: 1,
    protocolNo: 'KAB-2024-001',
    title: 'AI-Powered Disease Diagnosis System',
    status: 'draft',
    piName: 'Dr. Jane Omondi',
    faculty: 'Faculty of Engineering',
    department: 'Computer Science',
    attachmentsSummary: '3 of 7 uploaded',
    membersCount: 2,
    createdAt: '2024-05-15',
    updatedAt: '2024-05-20',
  },
  {
    id: 2,
    protocolNo: 'KAB-2024-002',
    title: 'Water Purification Technology for Rural Areas',
    status: 'submitted',
    piName: 'Prof. John Kipchoge',
    faculty: 'Faculty of Science',
    department: 'Chemistry',
    attachmentsSummary: '7 of 7 uploaded',
    membersCount: 3,
    createdAt: '2024-04-10',
    updatedAt: '2024-05-10',
  },
  {
    id: 3,
    protocolNo: 'KAB-2024-003',
    title: 'Climate-Smart Agriculture Solutions',
    status: 'under_review',
    piName: 'Dr. Grace Kiplagat',
    faculty: 'Faculty of Agriculture',
    department: 'Agronomy',
    attachmentsSummary: '7 of 7 uploaded',
    membersCount: 4,
    createdAt: '2024-03-05',
    updatedAt: '2024-04-20',
  },
];

const mockNotifications = [
  {
    id: 1,
    type: 'draft_saved',
    title: 'Draft Saved',
    message: 'Your proposal draft has been saved successfully.',
    createdAt: '2024-05-20T10:30:00',
    read: false,
  },
  {
    id: 2,
    type: 'missing_attachments',
    title: 'Missing Attachments',
    message: 'Proposal KAB-2024-001 is missing 4 required attachments.',
    createdAt: '2024-05-19T14:15:00',
    read: false,
  },
  {
    id: 3,
    type: 'proposal_submitted',
    title: 'Proposal Submitted',
    message: 'Your proposal KAB-2024-002 has been submitted successfully.',
    createdAt: '2024-05-10T09:00:00',
    read: true,
  },
  {
    id: 4,
    type: 'scheduled_review',
    title: 'Review Scheduled',
    message: 'Your proposal KAB-2024-002 is scheduled for review on May 25, 2024.',
    createdAt: '2024-05-08T11:20:00',
    read: true,
  },
];

const mockTeamMembers = [
  {
    id: 1,
    firstName: 'Jane',
    lastName: 'Omondi',
    qualifications: 'PhD in Computer Science',
    gender: 'Female',
    designation: 'Principal Investigator',
    faculty: 'Faculty of Engineering',
    department: 'Computer Science',
    specialization: 'Machine Learning',
    email: 'j.omondi@university.ac.ke',
    phone: '+254712345678',
  },
  {
    id: 2,
    firstName: 'Peter',
    lastName: 'Kimani',
    qualifications: 'MSc in Data Science',
    gender: 'Male',
    designation: 'Co-Investigator',
    faculty: 'Faculty of Engineering',
    department: 'Computer Science',
    specialization: 'Data Analytics',
    email: 'p.kimani@university.ac.ke',
    phone: '+254723456789',
  },
];

const mockAttachments = [
  {
    id: 1,
    type: 'main_proposal',
    name: 'Main Proposal Document',
    required: true,
    status: 'uploaded',
    fileName: 'proposal_main.pdf',
    uploadedAt: '2024-05-20T10:15:00',
  },
  {
    id: 2,
    type: 'budget',
    name: 'Budget',
    required: true,
    status: 'not_uploaded',
    fileName: null,
  },
  {
    id: 3,
    type: 'work_plan',
    name: 'Work Plan / Gantt Chart',
    required: true,
    status: 'not_uploaded',
    fileName: null,
  },
  {
    id: 4,
    type: 'cvs',
    name: 'CVs',
    required: true,
    status: 'uploaded',
    fileName: 'cvs.zip',
    uploadedAt: '2024-05-20T10:20:00',
  },
  {
    id: 5,
    type: 'consent_forms',
    name: 'Consent Forms',
    required: true,
    status: 'not_uploaded',
    fileName: null,
  },
  {
    id: 6,
    type: 'national_id',
    name: 'National ID / NIN',
    required: true,
    status: 'uploaded',
    fileName: 'national_id.pdf',
    uploadedAt: '2024-05-18T14:30:00',
  },
  {
    id: 7,
    type: 'confirmation_letter',
    name: 'Confirmation Letter',
    required: false,
    status: 'not_uploaded',
    fileName: null,
  },
  {
    id: 8,
    type: 'faculty_letter',
    name: 'Faculty Letter / Faculty Support Evidence',
    required: false,
    status: 'not_uploaded',
    fileName: null,
  },
  {
    id: 9,
    type: 'research_instruments',
    name: 'Research Instruments',
    required: false,
    status: 'not_uploaded',
    fileName: null,
  },
];

// API Functions

export const getApplicantDashboard = async () => {
  try {
    // Replace with: const response = await axiosClient.get('/applicant/dashboard');
    const response = await new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            data: {
              applicantName: 'Dr. Jane Omondi',
              recentProposals: mockProposals.slice(0, 3),
              totalProposals: mockProposals.length,
              draftCount: 1,
              submittedCount: 1,
              underReviewCount: 1,
              stats: {
                totalProposals: 3,
                approved: 1,
                underReview: 1,
                draft: 1,
              },
            },
          }),
        500
      )
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch applicant dashboard');
  }
};

export const getMyProposals = async () => {
  try {
    // Replace with: const response = await axiosClient.get('/applicant/proposals');
    const response = await new Promise((resolve) =>
      setTimeout(() => resolve({ data: mockProposals }), 500)
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch proposals');
  }
};

export const getProposalDetails = async (proposalId) => {
  try {
    // Replace with: const response = await axiosClient.get(`/applicant/proposals/${proposalId}`);
    const proposal = mockProposals.find((p) => p.id === parseInt(proposalId));
    const response = await new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            data: {
              ...proposal,
              piFirstName: 'Jane',
              piLastName: 'Omondi',
              piEmail: 'j.omondi@university.ac.ke',
              piPhone: '+254712345678',
              summary: 'This is a research proposal summary about AI-powered disease diagnosis.',
              teamMembers: mockTeamMembers,
              attachments: mockAttachments,
              reviewReport: {
                status: 'pending',
                reviewer: null,
                feedback: null,
              },
              timeline: {
                draftCreated: '2024-05-15T08:00:00',
                attachmentsUploaded: '2024-05-20T10:30:00',
                submitted: null,
                scheduledReview: null,
                reviewed: null,
                decision: null,
              },
            },
          }),
        500
      )
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch proposal details');
  }
};

export const createProposalDraft = async (payload) => {
  try {
    // Replace with: const response = await axiosClient.post('/applicant/proposals/draft', payload);
    const response = await new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            data: {
              id: mockProposals.length + 1,
              protocolNo: `KAB-${new Date().getFullYear()}-${String(mockProposals.length + 1).padStart(3, '0')}`,
              ...payload,
              status: 'draft',
              createdAt: new Date().toISOString(),
            },
          }),
        500
      )
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to create proposal draft');
  }
};

export const updateProposal = async (proposalId, payload) => {
  try {
    // Replace with: const response = await axiosClient.put(`/applicant/proposals/${proposalId}`, payload);
    const response = await new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            data: {
              id: proposalId,
              ...payload,
              updatedAt: new Date().toISOString(),
            },
          }),
        500
      )
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to update proposal');
  }
};

export const deleteDraft = async (proposalId) => {
  try {
    // Replace with: await axiosClient.delete(`/applicant/proposals/${proposalId}`);
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete draft');
  }
};

export const submitProposal = async (proposalId) => {
  try {
    // Replace with: const response = await axiosClient.post(`/applicant/proposals/${proposalId}/submit`);
    const response = await new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            data: {
              id: proposalId,
              status: 'submitted',
              submittedAt: new Date().toISOString(),
            },
          }),
        500
      )
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to submit proposal');
  }
};

export const getProposalAttachments = async (proposalId) => {
  try {
    // Replace with: const response = await axiosClient.get(`/applicant/proposals/${proposalId}/attachments`);
    const response = await new Promise((resolve) =>
      setTimeout(() => resolve({ data: mockAttachments }), 500)
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch attachments');
  }
};

export const uploadProposalAttachment = async (proposalId, attachmentType, file) => {
  try {
    // Replace with FormData approach for real API:
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('type', attachmentType);
    // const response = await axiosClient.post(`/applicant/proposals/${proposalId}/attachments`, formData);
    const response = await new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            data: {
              id: Math.random(),
              proposalId,
              type: attachmentType,
              fileName: file.name,
              uploadedAt: new Date().toISOString(),
            },
          }),
        500
      )
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to upload attachment');
  }
};

export const deleteProposalAttachment = async (attachmentId) => {
  try {
    // Replace with: await axiosClient.delete(`/applicant/attachments/${attachmentId}`);
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete attachment');
  }
};

export const getProjectTeamMembers = async (proposalId) => {
  try {
    // Replace with: const response = await axiosClient.get(`/applicant/proposals/${proposalId}/team-members`);
    const response = await new Promise((resolve) =>
      setTimeout(() => resolve({ data: mockTeamMembers }), 500)
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch team members');
  }
};

export const addProjectTeamMember = async (proposalId, payload) => {
  try {
    // Replace with: const response = await axiosClient.post(`/applicant/proposals/${proposalId}/team-members`, payload);
    const response = await new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            data: {
              id: Math.random(),
              ...payload,
            },
          }),
        500
      )
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to add team member');
  }
};

export const deleteProjectTeamMember = async (memberId) => {
  try {
    // Replace with: await axiosClient.delete(`/applicant/team-members/${memberId}`);
    await new Promise((resolve) => setTimeout(() => resolve(), 500));
    return { success: true };
  } catch (error) {
    throw new Error('Failed to delete team member');
  }
};

export const getApplicantNotifications = async () => {
  try {
    // Replace with: const response = await axiosClient.get('/applicant/notifications');
    const response = await new Promise((resolve) =>
      setTimeout(() => resolve({ data: mockNotifications }), 500)
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch notifications');
  }
};
