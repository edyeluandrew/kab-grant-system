# 🔨 FRONTEND API IMPLEMENTATION GUIDE
## Quick Reference: What to Add/Update in Each API File

**Purpose**: Tell frontend devs exactly which functions to create/update and where

---

## 📁 FILE STRUCTURE

```
frontend/src/api/
├── authApi.js          ⚠️ Update 2 functions
├── adminApi.js         ✅ OK (nothing needed)
├── reviewerApi.js      ✅ OK (nothing needed)
├── applicantApi.js     ❌ ADD 8 functions
├── referenceApi.js     ❌ ADD 3 functions
└── axiosClient.js      ✅ OK (already configured)
```

---

## 🔴 authApi.js - UPDATE (2/7 missing)

### Update #1: Enhance `forgotPassword()`

**Current Code** (needs enhancement):
```javascript
export const forgotPassword = async (payload) => {
  // Current: Basic implementation
};
```

**New Code**:
```javascript
export const forgotPassword = async (payload) => {
  try {
    const response = await axiosClient.post('/auth/forgot-password', payload);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock forgot password', apiError.message);
    await delay();

    // Always return success message (security: don't reveal if email exists)
    return {
      message: "OTP sent to email if account exists",
      detail: "Check your email for the OTP code. Valid for 1 hour."
    };
  }
};
```

**Usage**:
```javascript
// In ForgotPassword.jsx
const handleSubmit = async (email) => {
  try {
    const result = await forgotPassword({ email });
    // Always show same message
    showMessage("Check your email for OTP");
    // Navigate to reset password page after 2 seconds
    setTimeout(() => navigate('/reset-password'), 2000);
  } catch (error) {
    // Also show same message even on error (security)
    showMessage("Check your email for OTP");
  }
};
```

---

### Update #2: Enhance `resetPassword()`

**Current Code** (needs enhancement):
```javascript
export const resetPassword = async (payload) => {
  // Current: Basic implementation
};
```

**New Code**:
```javascript
export const resetPassword = async (payload) => {
  try {
    const response = await axiosClient.post('/auth/reset-password', payload);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock reset password', apiError.message);
    await delay();

    // Validation
    if (payload.new_password !== payload.confirm_password) {
      throw new Error('Passwords do not match');
    }

    if (payload.new_password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Mock: Validate OTP (in production, backend validates)
    if (payload.otp_code !== '123456') {
      throw new Error('Invalid or expired OTP code');
    }

    return {
      message: "Password reset successfully. Please log in with your new password."
    };
  }
};
```

---

## ❌ referenceApi.js - ADD 3 FUNCTIONS

**Create or update this file** with these 3 new functions:

```javascript
// File: frontend/src/api/referenceApi.js
import axiosClient from './axiosClient';
import { delay } from '../utils/performanceUtils';

// ─── Faculties ────────────────────────────────────────────────────────────────

export const getFaculties = async () => {
  try {
    const response = await axiosClient.get('/general/faculties');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock faculties', apiError.message);
    await delay();

    const mockFaculties = [
      { id: 1, name: "Faculty of Computing and Informatics" },
      { id: 2, name: "Faculty of Medicine" },
      { id: 3, name: "Faculty of Engineering" },
      { id: 4, name: "Faculty of Business and Economics" },
      { id: 5, name: "Faculty of Science" }
    ];

    return mockFaculties;
  }
};

// ─── Departments ──────────────────────────────────────────────────────────────

export const getDepartments = async (facultyId = null) => {
  try {
    const params = facultyId ? { faculty_id: facultyId } : {};
    const response = await axiosClient.get('/general/departments', { params });
    return response.data;
  } catch (apiError) {
    console.warn('Using mock departments', apiError.message);
    await delay();

    const mockDepartments = [
      // Faculty 1
      { id: 101, name: "Computer Science", faculty_id: 1 },
      { id: 102, name: "Information Technology", faculty_id: 1 },
      { id: 103, name: "Software Engineering", faculty_id: 1 },
      // Faculty 2
      { id: 201, name: "General Medicine", faculty_id: 2 },
      { id: 202, name: "Paediatrics", faculty_id: 2 },
      { id: 203, name: "Surgery", faculty_id: 2 },
      // Faculty 3
      { id: 301, name: "Civil Engineering", faculty_id: 3 },
      { id: 302, name: "Electrical Engineering", faculty_id: 3 },
      // Faculty 4
      { id: 401, name: "Accounting", faculty_id: 4 },
      { id: 402, name: "Business Administration", faculty_id: 4 },
      // Faculty 5
      { id: 501, name: "Biology", faculty_id: 5 },
      { id: 502, name: "Chemistry", faculty_id: 5 }
    ];

    if (facultyId) {
      return mockDepartments.filter(d => d.faculty_id === facultyId);
    }
    return mockDepartments;
  }
};

// ─── System Settings ──────────────────────────────────────────────────────────

export const getSystemSettings = async () => {
  try {
    const response = await axiosClient.get('/general/settings');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock settings', apiError.message);
    await delay();

    return {
      id: 1,
      system_name: "KAB Fund for Innovation and Research (KAB-FIR)",
      system_motto: "Supporting research excellence and innovation",
      address: "Kabale University, Kabale, Uganda",
      email: "kabfir@kab.ac.ug",
      phone: "+256-777-123-456",
      active_academic_year: 2026,
      submission_deadline: "2026-12-31",
      is_accepting_applications: true,
      system_logo_url: "https://res.cloudinary.com/kab-fir/image/upload/logo.png",
      system_banner_url: "https://res.cloudinary.com/kab-fir/image/upload/banner.jpg"
    };
  }
};

// ─── Export all ───────────────────────────────────────────────────────────────

export default {
  getFaculties,
  getDepartments,
  getSystemSettings
};
```

**Where to Use**:
- `getFaculties()`: Registration form, proposal forms
- `getDepartments(facultyId)`: Department dropdown (filters by faculty)
- `getSystemSettings()`: Before showing proposal submission form, landing page

---

## ❌ applicantApi.js - ADD 8 FUNCTIONS

**Add these functions to applicantApi.js**:

```javascript
// File: frontend/src/api/applicantApi.js
import axiosClient from './axiosClient';
import { delay } from '../utils/performanceUtils';
import { getSystemSettings } from './referenceApi';

// Helper: Generate protocol number
const generateProtocolNo = (id, year) => {
  return `PR${year}/PROPOSAL/${id.toString().padStart(3, '0')}`;
};

let proposalCounter = 100; // Start counter at 100 to avoid conflicts

// ─── Create Proposal ──────────────────────────────────────────────────────────

export const createProposal = async (payload) => {
  try {
    const response = await axiosClient.post('/proposals', payload);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock create proposal', apiError.message);
    await delay();

    // Check if submissions are closed
    const settings = await getSystemSettings();
    if (!settings.is_accepting_applications) {
      throw new Error("Submissions are currently closed. Please try again during the next application window.");
    }

    const deadline = new Date(settings.submission_deadline);
    if (new Date() > deadline) {
      throw new Error("Submission deadline has passed");
    }

    // Check title uniqueness
    const proposals = JSON.parse(localStorage.getItem('kab_proposals') || '[]');
    if (proposals.some(p => p.title === payload.title && p.created_by === getCurrentUserId())) {
      throw new Error("You already have a proposal with this title");
    }

    // Create new proposal
    const newProposal = {
      id: ++proposalCounter,
      protocol_no: generateProtocolNo(proposalCounter, settings.active_academic_year),
      ...payload,
      status: "Draft",
      academic_year: settings.active_academic_year,
      attachments: [],
      team_members: [],
      created_by: getCurrentUserId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    proposals.push(newProposal);
    localStorage.setItem('kab_proposals', JSON.stringify(proposals));

    return newProposal;
  }
};

// ─── Get My Proposals ─────────────────────────────────────────────────────────

export const getMyProposals = async () => {
  try {
    const response = await axiosClient.get('/proposals/my');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock get my proposals', apiError.message);
    await delay();

    const userId = getCurrentUserId();
    const proposals = JSON.parse(localStorage.getItem('kab_proposals') || '[]');

    return proposals
      .filter(p => p.created_by === userId)
      .map(p => ({
        id: p.id,
        protocol_no: p.protocol_no,
        grant_type: p.grant_type,
        title: p.title,
        status: p.status,
        total_budget: p.total_budget,
        attachments_count: p.attachments?.length || 0,
        team_members_count: p.team_members?.length || 0,
        created_at: p.created_at,
        updated_at: p.updated_at
      }));
  }
};

// ─── Get Proposal Details ─────────────────────────────────────────────────────

export const getProposalDetail = async (proposalId) => {
  try {
    const response = await axiosClient.get(`/proposals/${proposalId}`);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock get proposal detail', apiError.message);
    await delay();

    const proposals = JSON.parse(localStorage.getItem('kab_proposals') || '[]');
    const proposal = proposals.find(p => p.id === parseInt(proposalId));

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    return proposal;
  }
};

// ─── Update Proposal ──────────────────────────────────────────────────────────

export const updateProposal = async (proposalId, updates) => {
  try {
    const response = await axiosClient.patch(`/proposals/${proposalId}`, updates);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock update proposal', apiError.message);
    await delay();

    const proposals = JSON.parse(localStorage.getItem('kab_proposals') || '[]');
    const proposal = proposals.find(p => p.id === parseInt(proposalId));

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    // Only editable if Draft or Missing Attachments
    if (!["Draft", "Missing Attachments"].includes(proposal.status)) {
      throw new Error(`Cannot edit proposal with status: ${proposal.status}`);
    }

    // Update fields
    const updated = { ...proposal, ...updates, updated_at: new Date().toISOString() };
    const index = proposals.findIndex(p => p.id === parseInt(proposalId));
    proposals[index] = updated;
    localStorage.setItem('kab_proposals', JSON.stringify(proposals));

    return updated;
  }
};

// ─── Delete Proposal ──────────────────────────────────────────────────────────

export const deleteProposal = async (proposalId) => {
  try {
    await axiosClient.delete(`/proposals/${proposalId}`);
    return { message: "Proposal deleted successfully" };
  } catch (apiError) {
    console.warn('Using mock delete proposal', apiError.message);
    await delay();

    const proposals = JSON.parse(localStorage.getItem('kab_proposals') || '[]');
    const proposal = proposals.find(p => p.id === parseInt(proposalId));

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    // Only deletable if Draft
    if (proposal.status !== "Draft") {
      throw new Error("Only draft proposals can be deleted");
    }

    const filtered = proposals.filter(p => p.id !== parseInt(proposalId));
    localStorage.setItem('kab_proposals', JSON.stringify(filtered));

    return { message: "Proposal deleted successfully" };
  }
};

// ─── Upload Attachment ────────────────────────────────────────────────────────

export const uploadAttachment = async (proposalId, file, attachmentType) => {
  try {
    const formData = new FormData();
    formData.append('attachment_type', attachmentType);
    formData.append('file', file);

    const response = await axiosClient.post(`/proposals/${proposalId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (apiError) {
    console.warn('Using mock upload attachment', apiError.message);
    await delay();

    // Validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("File too large. Maximum size is 10MB");
    }

    const allowedTypes = ['application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Allowed: PDF, DOC, DOCX");
    }

    const requiredTypes = [
      "Full Proposal Document", "Gantt Chart", "Budget",
      "National ID", "Confirmation Letter", "CVs",
      "Consent Forms", "Research Instruments", "Faculty Support Evidence"
    ];

    if (!requiredTypes.includes(attachmentType)) {
      throw new Error(`Invalid attachment type: ${attachmentType}`);
    }

    // Create blob URL
    const blobUrl = URL.createObjectURL(file);

    // Update localStorage
    const proposals = JSON.parse(localStorage.getItem('kab_proposals') || '[]');
    const proposal = proposals.find(p => p.id === parseInt(proposalId));

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    // Add or replace attachment
    const newAttachment = {
      id: Date.now(),
      attachment_type: attachmentType,
      file_name: file.name,
      cloudinary_url: blobUrl,
      file_size: file.size,
      uploaded_at: new Date().toISOString()
    };

    const existingIndex = proposal.attachments.findIndex(a => a.attachment_type === attachmentType);
    if (existingIndex >= 0) {
      proposal.attachments[existingIndex] = newAttachment;
    } else {
      proposal.attachments.push(newAttachment);
    }

    // Check if all 9 types uploaded - auto-submit
    const hasAllTypes = requiredTypes.every(type =>
      proposal.attachments.some(a => a.attachment_type === type)
    );

    if (hasAllTypes) {
      proposal.status = "Submitted";
    }

    localStorage.setItem('kab_proposals', JSON.stringify(proposals));

    return newAttachment;
  }
};

// ─── Add Team Member ──────────────────────────────────────────────────────────

export const addTeamMember = async (proposalId, memberData) => {
  try {
    const response = await axiosClient.post(`/proposals/${proposalId}/team-members`, memberData);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock add team member', apiError.message);
    await delay();

    const proposals = JSON.parse(localStorage.getItem('kab_proposals') || '[]');
    const proposal = proposals.find(p => p.id === parseInt(proposalId));

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    // Only allowed if Draft or Missing Attachments
    if (!["Draft", "Missing Attachments"].includes(proposal.status)) {
      throw new Error("Cannot add team members to submitted proposals");
    }

    // Max 10 team members
    if (proposal.team_members.length >= 10) {
      throw new Error("Maximum 10 team members allowed");
    }

    const newMember = {
      id: Date.now(),
      ...memberData
    };

    proposal.team_members.push(newMember);
    localStorage.setItem('kab_proposals', JSON.stringify(proposals));

    return newMember;
  }
};

// ─── Remove Team Member ───────────────────────────────────────────────────────

export const removeTeamMember = async (proposalId, memberId) => {
  try {
    await axiosClient.delete(`/proposals/${proposalId}/team-members/${memberId}`);
    return { message: "Team member removed successfully" };
  } catch (apiError) {
    console.warn('Using mock remove team member', apiError.message);
    await delay();

    const proposals = JSON.parse(localStorage.getItem('kab_proposals') || '[]');
    const proposal = proposals.find(p => p.id === parseInt(proposalId));

    if (!proposal) {
      throw new Error("Proposal not found");
    }

    const memberIndex = proposal.team_members.findIndex(m => m.id === parseInt(memberId));
    if (memberIndex === -1) {
      throw new Error("Team member not found");
    }

    proposal.team_members.splice(memberIndex, 1);
    localStorage.setItem('kab_proposals', JSON.stringify(proposals));

    return { message: "Team member removed successfully" };
  }
};

// ─── Helper: Get Current User ID ───────────────────────────────────────────────

function getCurrentUserId() {
  const userStr = localStorage.getItem('kab_auth_user');
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr);
    return user.id;
  } catch (e) {
    return null;
  }
}

// ─── Export all ───────────────────────────────────────────────────────────────

export default {
  createProposal,
  getMyProposals,
  getProposalDetail,
  updateProposal,
  deleteProposal,
  uploadAttachment,
  addTeamMember,
  removeTeamMember
};
```

---

## 📝 USAGE EXAMPLES

### In Applicant Proposal Pages

**SubmitProposal.jsx** (create new proposal):
```javascript
import { createProposal } from '../api/applicantApi';
import { getSystemSettings } from '../api/referenceApi';

function SubmitProposal() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      
      // Check if submissions open
      const settings = await getSystemSettings();
      if (!settings.is_accepting_applications) {
        showError("Submissions are currently closed");
        return;
      }

      const proposal = await createProposal(formData);
      showSuccess("Proposal created successfully!");
      navigate(`/applicant/proposals/${proposal.id}`);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (/* form JSX */);
}
```

**MyProposals.jsx** (list proposals):
```javascript
import { getMyProposals } from '../api/applicantApi';

function MyProposals() {
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      const data = await getMyProposals();
      setProposals(data);
    } catch (error) {
      console.error("Error loading proposals:", error);
    }
  };

  return (/* list JSX */);
}
```

**UploadDocuments.jsx** (upload attachments):
```javascript
import { uploadAttachment } from '../api/applicantApi';

function UploadDocuments({ proposalId }) {
  const requiredAttachmentTypes = [
    "Full Proposal Document",
    "Gantt Chart",
    "Budget",
    "National ID",
    "Confirmation Letter",
    "CVs",
    "Consent Forms",
    "Research Instruments",
    "Faculty Support Evidence"
  ];

  const handleUpload = async (file, attachmentType) => {
    try {
      const attachment = await uploadAttachment(proposalId, file, attachmentType);
      showSuccess(`${attachmentType} uploaded successfully`);
      
      // Refresh to show auto-submitted status if all 9 uploaded
      loadProposal();
    } catch (error) {
      showError(error.message);
    }
  };

  return (/* upload form JSX */);
}
```

---

## ✅ TESTING CHECKLIST

**Before releasing to production**:

- [ ] Test `createProposal` with valid data
- [ ] Test `createProposal` when submissions closed (should error)
- [ ] Test `getMyProposals` returns only current user's proposals
- [ ] Test `updateProposal` only works on Draft status
- [ ] Test `uploadAttachment` validates file size and type
- [ ] Test auto-submit when all 9 attachments uploaded
- [ ] Test `addTeamMember` max 10 limit
- [ ] Test `removeTeamMember` from proposal
- [ ] Test `getFaculties` returns 5+ faculties
- [ ] Test `getDepartments` filters by facultyId
- [ ] Test `getSystemSettings` includes deadline and is_accepting_applications

---

**Implementation Time Estimate**: 4-6 hours for experienced frontend dev  
**Testing Time Estimate**: 2-3 hours

**Last Updated**: May 25, 2026
