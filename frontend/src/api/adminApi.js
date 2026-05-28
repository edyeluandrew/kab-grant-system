import axiosClient from './axiosClient';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockDashboardStats = {
  submitted: 12,
  scheduled_for_review: 5,
  reviewed: 3,
  approved: 7,
  rejected: 2,
  awarded: 1,
  total: 30,
};

const mockUsers = [
  { id: 1, first_name: 'Jane', surname: 'Omondi', phone: '+256712345678', email: 'j.omondi@kab.ac.ug', faculty: 'Faculty of Engineering', is_active: true },
  { id: 2, first_name: 'Peter', surname: 'Kimani', phone: '+256723456789', email: 'p.kimani@kab.ac.ug', faculty: 'Faculty of Science', is_active: true },
  { id: 3, first_name: 'Grace', surname: 'Kiplagat', phone: '+256734567890', email: 'g.kiplagat@kab.ac.ug', faculty: 'Faculty of Agriculture', is_active: false },
  { id: 4, first_name: 'David', surname: 'Mugisha', phone: '+256745678901', email: 'd.mugisha@kab.ac.ug', faculty: 'Faculty of Health Sciences', is_active: true },
];

const mockReviewers = [
  { id: 1, first_name: 'Prof. Samuel', surname: 'Wafula', phone: '+256756789012', email: 'swafula@external.org', research_discipline: 'Biomedical Engineering' },
  { id: 2, first_name: 'Dr. Mary', surname: 'Achieng', phone: '+256767890123', email: 'machieng@university.ac.ug', research_discipline: 'Agricultural Sciences' },
  { id: 3, first_name: 'Dr. John', surname: 'Byarugaba', phone: '+256778901234', email: 'jbyarugaba@research.org', research_discipline: 'Information Technology' },
];

const mockProposals = {
  submitted: [
    { id: 1, protocol_no: 'PR2026/PROPOSAL/001', title: 'AI-Powered Disease Diagnosis System', grant_type: 'Research', pi_first_name: 'Jane', pi_last_name: 'Omondi', pi_phone: '+256712345678', attachments_count: 9, status: 'Submitted', created_at: '2026-05-01', assigned_reviewers: [] },
    { id: 2, protocol_no: 'PR2026/PROPOSAL/002', title: 'Water Purification Technology for Rural Areas', grant_type: 'Innovation', pi_first_name: 'Prof. John', pi_last_name: 'Kipchoge', pi_phone: '+256723456789', attachments_count: 9, status: 'Submitted', created_at: '2026-05-03', assigned_reviewers: [] },
  ],
  scheduled: [
    { id: 3, protocol_no: 'PR2026/PROPOSAL/003', title: 'Climate-Smart Agriculture Solutions', grant_type: 'Research', pi_first_name: 'Dr. Grace', pi_last_name: 'Kiplagat', pi_phone: '+256734567890', attachments_count: 9, status: 'Scheduled for Review', created_at: '2026-04-20', assigned_reviewers: [{ id: 1, first_name: 'Prof. Samuel', surname: 'Wafula', review_deadline: '2026-06-15', submitted_review: false }, { id: 2, first_name: 'Dr. Mary', surname: 'Achieng', review_deadline: '2026-06-15', submitted_review: false }] },
  ],
  reviewed: [
    { id: 4, protocol_no: 'PR2026/PROPOSAL/004', title: 'Blockchain for Land Registry', grant_type: 'Innovation', pi_first_name: 'David', pi_last_name: 'Mugisha', pi_phone: '+256745678901', attachments_count: 9, status: 'Reviewed', created_at: '2026-04-10', assigned_reviewers: [{ id: 1, first_name: 'Prof. Samuel', surname: 'Wafula', review_deadline: '2026-06-01', submitted_review: true }, { id: 3, first_name: 'Dr. John', surname: 'Byarugaba', review_deadline: '2026-06-01', submitted_review: true }] },
  ],
  approved: [
    { id: 5, protocol_no: 'PR2026/PROPOSAL/005', title: 'Solar Energy for Rural Schools', grant_type: 'Innovation', pi_first_name: 'Alice', pi_last_name: 'Nakato', pi_phone: '+256756789012', attachments_count: 9, status: 'Approved', created_at: '2026-03-15', assigned_reviewers: [] },
  ],
  rejected: [
    { id: 6, protocol_no: 'PR2026/PROPOSAL/006', title: 'Mobile Health Monitoring System', grant_type: 'Research', pi_first_name: 'Brian', pi_last_name: 'Tumwine', pi_phone: '+256767890123', attachments_count: 9, status: 'Rejected', created_at: '2026-03-10', assigned_reviewers: [] },
  ],
  awarded: [
    { id: 7, protocol_no: 'PR2026/PROPOSAL/007', title: 'Cassava Disease Detection Using ML', grant_type: 'Research', pi_first_name: 'Ruth', pi_last_name: 'Atukunda', pi_phone: '+256778901234', attachments_count: 9, status: 'Awarded', created_at: '2026-02-20', assigned_reviewers: [] },
  ],
};

const mockProposalDetail = {
  id: 1,
  protocol_no: 'PR2026/PROPOSAL/001',
  title: 'AI-Powered Disease Diagnosis System',
  grant_type: 'Research',
  status: 'Submitted',
  academic_year: 2026,
  pi_first_name: 'Jane',
  pi_last_name: 'Omondi',
  pi_email: 'j.omondi@kab.ac.ug',
  pi_phone: '+256712345678',
  pi_faculty: 'Faculty of Engineering',
  pi_department: 'Computer Science',
  pi_qualification: 'PhD',
  pi_designation: 'Lecturer',
  total_budget: 45000000,
  project_summary: 'This project aims to develop an AI-powered system for early disease diagnosis using machine learning algorithms trained on local patient data.',
  problem_statement: 'Late disease diagnosis remains a critical challenge in rural Uganda due to limited specialist availability.',
  proposed_solution: 'We propose developing a mobile-based AI diagnostic tool accessible to community health workers.',
  relevance: 'Aligned with NDP IV health outcomes and SDG 3 (Good Health and Well-being).',
  innovativeness: 'First locally-trained diagnostic AI using Ugandan patient data.',
  main_objective: 'To develop and validate an AI-powered disease diagnosis system for rural health facilities.',
  specific_objectives: '1. Collect and annotate local patient data\n2. Train ML models\n3. Develop mobile interface\n4. Validate in pilot facilities',
  methods_description: 'Mixed-methods approach combining quantitative data collection from 500 patients across 5 health facilities with qualitative usability testing.',
  outcomes: 'Improved early diagnosis rates by 40% in pilot facilities. 200 health workers trained.',
  dissemination: 'Peer-reviewed publications, community workshops, Ministry of Health policy brief.',
  policy_impact: 'Inform national telemedicine policy framework.',
  scalability: 'Scalable to all 112 districts via Ministry of Health partnership.',
  sustainability: 'Post-project maintenance via health facility subscription model.',
  gender_considerations: 'Gender-balanced data collection; 50% female participants targeted.',
  ethical_impact: 'IRB approval obtained. Informed consent from all participants.',
  capacity_building: 'Training of 5 PhD students and 10 research assistants.',
  conflict_of_interest: 'None declared.',
  references: 'WHO (2023). Digital Health Strategy. Geneva: WHO.',
  created_at: '2026-05-01',
  team_members: [
    { id: 1, first_name: 'Peter', last_name: 'Kimani', designation: 'Co-Investigator', department: 'Computer Science', email: 'p.kimani@kab.ac.ug' },
  ],
  attachments: [
    { id: 1, attachment_type: 'Full Proposal Document', file_name: 'proposal_main.pdf', cloudinary_url: '#', uploaded_at: '2026-05-02' },
    { id: 2, attachment_type: 'Budget', file_name: 'budget_2026.pdf', cloudinary_url: '#', uploaded_at: '2026-05-02' },
    { id: 3, attachment_type: 'Gantt Chart', file_name: 'gantt_chart.pdf', cloudinary_url: '#', uploaded_at: '2026-05-02' },
    { id: 4, attachment_type: 'CVs', file_name: 'cvs.pdf', cloudinary_url: '#', uploaded_at: '2026-05-02' },
    { id: 5, attachment_type: 'Consent Forms', file_name: 'consent_forms.pdf', cloudinary_url: '#', uploaded_at: '2026-05-02' },
    { id: 6, attachment_type: 'National ID', file_name: 'national_id.pdf', cloudinary_url: '#', uploaded_at: '2026-05-02' },
    { id: 7, attachment_type: 'Confirmation Letter', file_name: 'confirmation_letter.pdf', cloudinary_url: '#', uploaded_at: '2026-05-02' },
    { id: 8, attachment_type: 'Faculty Support Evidence', file_name: 'faculty_support.pdf', cloudinary_url: '#', uploaded_at: '2026-05-02' },
    { id: 9, attachment_type: 'Research Instruments', file_name: 'research_instruments.pdf', cloudinary_url: '#', uploaded_at: '2026-05-02' },
  ],
  review_reports: [
    {
      id: 1,
      reviewer_name: 'Prof. Samuel Wafula',
      recommendation: 'Approve',
      comments: 'Well-structured research with clear objectives and strong methodology.',
      report_file_url: '#',
      submitted_at: '2026-05-15',
    },
  ],
};

// ─── Helper ───────────────────────────────────────────────────────────────────

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getAdminDashboard = async () => {
  try {
    const response = await axiosClient.get('/admin/dashboard');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock dashboard (API unavailable)', apiError.message);
    await delay();
    return mockDashboardStats;
  }
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUsers = async () => {
  try {
    const response = await axiosClient.get('/admin/users');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock users (API unavailable)', apiError.message);
    await delay();
    return mockUsers;
  }
};

export const deactivateUser = async (userId) => {
  try {
    const response = await axiosClient.patch(`/admin/users/${userId}/deactivate`);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock deactivate user (API unavailable)', apiError.message);
    await delay();
    return { success: true };
  }
};

export const activateUser = async (userId) => {
  try {
    const response = await axiosClient.patch(`/admin/users/${userId}/activate`);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock activate user (API unavailable)', apiError.message);
    await delay();
    return { success: true };
  }
};

// ─── Reviewers ────────────────────────────────────────────────────────────────

export const getReviewers = async () => {
  try {
    const response = await axiosClient.get('/admin/reviewers');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock reviewers (API unavailable)', apiError.message);
    await delay();
    return mockReviewers;
  }
};

export const createReviewer = async (payload) => {
  try {
    const response = await axiosClient.post('/admin/reviewers', payload);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock create reviewer (API unavailable)', apiError.message);
    await delay();
    const newReviewer = {
      id: Math.floor(Math.random() * 10000),
      first_name: payload.first_name,
      surname: payload.surname,
      phone: payload.phone || '-',
      email: payload.email,
      research_discipline: payload.research_discipline || '-',
    };
    return newReviewer;
  }
};

export const removeReviewer = async (reviewerId) => {
  try {
    const response = await axiosClient.delete(`/admin/reviewers/${reviewerId}`);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock remove reviewer (API unavailable)', apiError.message);
    await delay();
    return { success: true };
  }
};

// ─── Proposals ────────────────────────────────────────────────────────────────

// ─── Proposals ────────────────────────────────────────────────────────────────

export const getSubmittedProposals = async () => {
  try {
    const response = await axiosClient.get('/admin/proposals/submitted');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock submitted proposals (API unavailable)', apiError.message);
    await delay();
    return mockProposals.submitted;
  }
};

export const getScheduledProposals = async () => {
  try {
    const response = await axiosClient.get('/admin/proposals/scheduled');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock scheduled proposals (API unavailable)', apiError.message);
    await delay();
    return mockProposals.scheduled;
  }
};

export const getReviewedProposals = async () => {
  try {
    const response = await axiosClient.get('/admin/proposals/reviewed');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock reviewed proposals (API unavailable)', apiError.message);
    await delay();
    return mockProposals.reviewed;
  }
};

export const getApprovedProposals = async () => {
  try {
    const response = await axiosClient.get('/admin/proposals/approved');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock approved proposals (API unavailable)', apiError.message);
    await delay();
    return mockProposals.approved;
  }
};

export const getRejectedProposals = async () => {
  try {
    const response = await axiosClient.get('/admin/proposals/rejected');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock rejected proposals (API unavailable)', apiError.message);
    await delay();
    return mockProposals.rejected;
  }
};

export const getAwardedProposals = async () => {
  try {
    const response = await axiosClient.get('/admin/proposals/awarded');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock awarded proposals (API unavailable)', apiError.message);
    await delay();
    return mockProposals.awarded;
  }
};

export const getAdminProposalDetail = async (proposalId) => {
  try {
    const response = await axiosClient.get(`/admin/proposals/${proposalId}`);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock proposal detail (API unavailable)', apiError.message);
    await delay();
    return { ...mockProposalDetail, id: parseInt(proposalId) };
  }
};

// ─── Assign Reviewers ─────────────────────────────────────────────────────────

export const assignReviewers = async (proposalId, reviewerIds) => {
  try {
    const response = await axiosClient.post(`/admin/proposals/${proposalId}/assign-reviewers`, { 
      reviewer_ids: reviewerIds 
    });
    return response.data;
  } catch (apiError) {
    console.warn('Using mock assign reviewers (API unavailable)', apiError.message);
    await delay();
    return { success: true };
  }
};

export const removeReviewerFromProposal = async (proposalId, reviewerId) => {
  try {
    const response = await axiosClient.delete(`/admin/proposals/${proposalId}/reviewers/${reviewerId}`);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock remove reviewer from proposal (API unavailable)', apiError.message);
    await delay();
    return { success: true };
  }
};

// ─── Final Decision ───────────────────────────────────────────────────────────

export const makeDecision = async (proposalId, decision, note = '') => {
  try {
    const response = await axiosClient.post(`/admin/proposals/${proposalId}/decision`, { 
      decision, 
      note 
    });
    return response.data;
  } catch (apiError) {
    console.warn('Using mock make decision (API unavailable)', apiError.message);
    await delay();
    return { success: true, decision };
  }
};

// ─── Review Deadline Management ───────────────────────────────────────────────

/**
 * Set review deadline for assigned reviewers
 * @param {number} proposalId - The proposal ID
 * @param {number} reviewerId - The reviewer ID
 * @param {string} deadline - Deadline date (YYYY-MM-DD format)
 */
export const setReviewDeadline = async (proposalId, reviewerId, deadline) => {
  try {
    const response = await axiosClient.post(`/admin/proposals/${proposalId}/reviewers/${reviewerId}/deadline`, { 
      deadline 
    });
    return response.data;
  } catch (apiError) {
    console.warn('Using mock set review deadline (API unavailable)', apiError.message);
    await delay();
    
    // Update mock data
    Object.values(mockProposals).forEach(proposalList => {
      const proposal = proposalList.find(p => p.id === proposalId);
      if (proposal && proposal.assigned_reviewers) {
        const reviewer = proposal.assigned_reviewers.find(r => r.id === reviewerId);
        if (reviewer) {
          reviewer.review_deadline = deadline;
        }
      }
    });
    
    return { success: true, message: 'Review deadline set successfully' };
  }
};

/**
 * Get review status for a proposal
 * @param {number} proposalId - The proposal ID
 */
export const getReviewStatus = async (proposalId) => {
  try {
    const response = await axiosClient.get(`/admin/proposals/${proposalId}/review-status`);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock get review status (API unavailable)', apiError.message);
    await delay();
    
    // Get from mock data
    let proposal = null;
    Object.values(mockProposals).forEach(proposalList => {
      const found = proposalList.find(p => p.id === proposalId);
      if (found) proposal = found;
    });
    
    if (!proposal) {
      return { reviewers: [] };
    }
    
    const reviewers = (proposal.assigned_reviewers || []).map(r => ({
      id: r.id,
      first_name: r.first_name,
      surname: r.surname,
      review_deadline: r.review_deadline,
      submitted_review: r.submitted_review,
      days_overdue: r.review_deadline ? Math.max(0, Math.ceil((new Date() - new Date(r.review_deadline)) / (1000 * 60 * 60 * 24))) : 0,
    }));
    
    return {
      proposalId,
      total_reviewers: reviewers.length,
      completed_reviews: reviewers.filter(r => r.submitted_review).length,
      pending_reviews: reviewers.filter(r => !r.submitted_review).length,
      overdue_reviews: reviewers.filter(r => !r.submitted_review && new Date() > new Date(r.review_deadline || '2099-12-31')).length,
      reviewers,
    };
  }
};

/**
 * Mark reviewer's submission status
 * @param {number} proposalId - The proposal ID
 * @param {number} reviewerId - The reviewer ID
 * @param {boolean} submitted - Whether review has been submitted
 */
export const updateReviewSubmission = async (proposalId, reviewerId, submitted) => {
  try {
    const response = await axiosClient.put(`/admin/proposals/${proposalId}/reviewers/${reviewerId}/submission`, { 
      submitted_review: submitted
    });
    return response.data;
  } catch (apiError) {
    console.warn('Using mock update review submission (API unavailable)', apiError.message);
    await delay();
    
    // Update mock data
    Object.values(mockProposals).forEach(proposalList => {
      const proposal = proposalList.find(p => p.id === proposalId);
      if (proposal && proposal.assigned_reviewers) {
        const reviewer = proposal.assigned_reviewers.find(r => r.id === reviewerId);
        if (reviewer) {
          reviewer.submitted_review = submitted;
        }
      }
    });
    
    return { success: true, message: 'Review submission status updated' };
  }
};