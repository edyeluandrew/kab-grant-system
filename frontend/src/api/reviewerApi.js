import axiosClient from './axiosClient';

const delay = (ms = 600) => new Promise((res) => setTimeout(res, ms));

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockAssignedProposals = [
  {
    id: 101,
    protocol_no: 'PR2026/PROPOSAL/001',
    title: 'AI-Based Malaria Detection in Rural Uganda',
    grant_type: 'Research',
    pi_first_name: 'Jane',
    pi_last_name: 'Omondi',
    pi_email: 'j.omondi@kab.ac.ug',
    pi_faculty: 'Faculty of Computing and Informatics',
    pi_department: 'Computer Science',
    status: 'Scheduled for Review',
    academic_year: 2026,
    total_budget: 15000000,
    project_summary: 'This research proposes an AI-driven diagnostic tool to detect malaria from blood smear images using convolutional neural networks, targeting low-resource rural health facilities in Uganda.',
    problem_statement: 'Malaria remains a leading cause of death in rural Uganda due to delayed diagnosis caused by lack of skilled laboratory technicians.',
    proposed_solution: 'Deploy a mobile-based AI model trained on malaria blood smear datasets to assist community health workers in rapid diagnosis.',
    methods_description: 'Mixed methods: dataset collection from regional hospitals, CNN model training using TensorFlow, field testing in 3 districts over 6 months.',
    review_submitted: false,
    team_members: [
      { id: 1, first_name: 'Paul', last_name: 'Kato', qualification: 'PhD', designation: 'Co-Investigator', email: 'p.kato@kab.ac.ug' },
    ],
    attachments: [
      { id: 1, attachment_type: 'Full Proposal Document', file_name: 'proposal_malaria_ai.pdf', cloudinary_url: '#' },
      { id: 2, attachment_type: 'Budget', file_name: 'budget.pdf', cloudinary_url: '#' },
    ],
  },
  {
    id: 102,
    protocol_no: 'PR2026/PROPOSAL/002',
    title: 'Solar-Powered Water Purification for Kigezi Highlands',
    grant_type: 'Innovation',
    pi_first_name: 'Robert',
    pi_last_name: 'Tumwebaze',
    pi_email: 'r.tumwebaze@kab.ac.ug',
    pi_faculty: 'Faculty of Engineering',
    pi_department: 'Environmental Engineering',
    status: 'Scheduled for Review',
    academic_year: 2026,
    total_budget: 22000000,
    project_summary: 'A low-cost solar-powered water purification system designed for communities in the Kigezi highlands with limited access to clean water.',
    problem_statement: 'Over 60% of communities in the Kigezi highlands lack access to safe drinking water, leading to high rates of waterborne diseases.',
    proposed_solution: 'Design and deploy solar-powered UV purification units that can be maintained locally with minimal technical skills.',
    methods_description: 'Prototype design, pilot deployment in 2 villages, water quality testing before and after, community training sessions.',
    review_submitted: true,
    team_members: [],
    attachments: [
      { id: 3, attachment_type: 'Full Proposal Document', file_name: 'solar_water_proposal.pdf', cloudinary_url: '#' },
    ],
  },
];

const REVIEWS_KEY = 'kab_reviewer_reviews';

const getStoredReviews = () => {
  try {
    const s = localStorage.getItem(REVIEWS_KEY);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
};

const saveReviews = (reviews) => localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));

// ─── API Functions ─────────────────────────────────────────────────────────────

export const getAssignedProposals = async () => {
  try {
    const response = await axiosClient.get('/reviewer/proposals');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock assigned proposals (API unavailable)', apiError.message);
    await delay();
    const reviews = getStoredReviews();
    return mockAssignedProposals.map((p) => ({
      ...p,
      review_submitted: reviews.some((r) => r.proposal_id === p.id),
    }));
  }
};

export const getAssignedProposalDetail = async (id) => {
  try {
    const response = await axiosClient.get(`/reviewer/proposals/${id}`);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock proposal detail (API unavailable)', apiError.message);
    await delay();
    const proposal = mockAssignedProposals.find((p) => p.id === Number(id));
    if (!proposal) throw new Error('Proposal not found or not assigned to you.');
    const reviews = getStoredReviews();
    return {
      ...proposal,
      review_submitted: reviews.some((r) => r.proposal_id === proposal.id),
      my_review: reviews.find((r) => r.proposal_id === proposal.id) || null,
    };
  }
};

export const submitReview = async (proposalId, payload) => {
  try {
    const formData = new FormData();
    formData.append('score', payload.score || 5);
    formData.append('recommendation', payload.recommendation);
    if (payload.comments) formData.append('comments', payload.comments);
    if (payload.report_file) formData.append('report_file', payload.report_file);
    
    const response = await axiosClient.post(`/reviewer/proposals/${proposalId}/review`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (apiError) {
    console.warn('Using mock submit review (API unavailable)', apiError.message);
    await delay(800);
    const reviews = getStoredReviews();
    if (reviews.some((r) => r.proposal_id === proposalId)) {
      throw new Error('You have already submitted a review for this proposal.');
    }
    const newReview = {
      id: Date.now(),
      proposal_id: proposalId,
      score: payload.score || 5,
      recommendation: payload.recommendation,
      comments: payload.comments || '',
      report_file_url: payload.report_file ? '#' : null,
      submitted_at: new Date().toISOString(),
    };
    reviews.push(newReview);
    saveReviews(reviews);
    return newReview;
  }
};

export const getSubmittedReviews = async () => {
  try {
    const response = await axiosClient.get('/reviewer/my-reviews');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock submitted reviews (API unavailable)', apiError.message);
    await delay();
    const reviews = getStoredReviews();
    return reviews.map((r) => {
      const proposal = mockAssignedProposals.find((p) => p.id === r.proposal_id);
      return {
        ...r,
        proposal_title: proposal?.title || 'Unknown',
        protocol_no: proposal?.protocol_no || '—',
        grant_type: proposal?.grant_type || '—',
      };
    });
  }
};

export const getReviewerDashboardStats = async () => {
  try {
    const response = await axiosClient.get('/reviewer/dashboard');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock dashboard stats (API unavailable)', apiError.message);
    await delay(300);
    const reviews = getStoredReviews();
    const total = mockAssignedProposals.length;
    const submitted = reviews.length;
    const pending = total - submitted;
    return { total_assigned: total, pending_review: pending, submitted_reviews: submitted };
  }
};
