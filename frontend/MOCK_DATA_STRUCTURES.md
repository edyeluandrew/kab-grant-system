# 📋 FRONTEND API MOCK DATA STRUCTURES & FIELD MAPPINGS
## Complete Guide for API Implementation & Backend Integration

**Purpose**: Define exact field names, types, and mock data for all frontend API endpoints  
**Date**: May 25, 2026

---

## 🔵 PART 1: AUTHENTICATION ENDPOINTS

### Endpoint 1: POST /auth/register
**Frontend Function**: `registerUser(payload)`

**Request Structure**:
```javascript
{
  "first_name": "John",
  "surname": "Doe",
  "email": "john.doe@kab.ac.ug",
  "password": "SecurePass123",
  "confirm_password": "SecurePass123",
  "faculty_id": 1,
  "department": "Computer Science"
}
```

**Response - 201 Created**:
```javascript
{
  "id": 5,
  "first_name": "John",
  "surname": "Doe",
  "email": "john.doe@kab.ac.ug",
  "role": "staff",
  "is_active": true,
  "created_at": "2026-05-25T10:00:00Z"
}
```

**Mock Data Implementation** (update authApi.js):
```javascript
// Mock response
const newUser = {
  id: mockUsersDB.length + 1,
  first_name: payload.first_name,
  surname: payload.surname,
  email: payload.email,
  role: "staff",
  is_active: true,
  created_at: new Date().toISOString()
};
```

**Field Validation** (Frontend):
- `first_name`: required, string, 2-50 chars
- `surname`: required, string, 2-50 chars
- `email`: required, must end with `@kab.ac.ug`
- `password`: required, min 8 chars, must include upper, lower, number
- `confirm_password`: required, must match password
- `faculty_id`: required, integer (from faculties list)
- `department`: required, string

---

### Endpoint 2: POST /auth/login
**Frontend Function**: `loginUser(payload)`

**Request**:
```javascript
{
  "email": "john.doe@kab.ac.ug",
  "password": "SecurePass123"
}
```

**Response - 200 OK**:
```javascript
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user_id": 2,
  "first_name": "John",
  "surname": "Doe",
  "email": "john.doe@kab.ac.ug",
  "role": "staff",
  "must_change_password": false
}
```

**Mock Data** (current authApi.js):
```javascript
const mockUsersDB = [
  {
    id: 1,
    email: "admin@kab.ac.ug",
    password: "admin1234",
    first_name: "Admin",
    surname: "User",
    role: "super_admin",
    is_active: true,
    access_token: "mock_token_admin_...",
    refresh_token: "mock_refresh_admin_...",
    must_change_password: false
  },
  // ... more users
];
```

**Status**: ✅ Already implemented correctly

---

### Endpoint 3: POST /auth/refresh
**Frontend Function**: `refreshToken(refreshTokenValue)`

**Request**:
```javascript
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response - 200 OK**:
```javascript
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**Status**: ✅ Already implemented

---

### Endpoint 4: POST /auth/change-password
**Frontend Function**: `changePassword(payload)`

**Request**:
```javascript
{
  "current_password": "OldPassword123",
  "new_password": "NewPassword456",
  "confirm_password": "NewPassword456"
}
```

**Response - 200 OK**:
```javascript
{
  "message": "Password changed successfully"
}
```

**Status**: ✅ Already implemented

---

### Endpoint 5: GET /auth/me
**Frontend Function**: `getMe()`

**Request**: No body (uses Authorization header)
```bash
GET /api/v1/auth/me
Authorization: Bearer {access_token}
```

**Response - 200 OK**:
```javascript
{
  "id": 2,
  "first_name": "John",
  "surname": "Doe",
  "email": "john.doe@kab.ac.ug",
  "role": "staff",
  "faculty_id": 1,
  "department": "Computer Science",
  "is_active": true,
  "created_at": "2026-05-20T10:00:00Z"
}
```

**Status**: ✅ Already implemented

---

### ⚠️ Endpoint 6: POST /auth/forgot-password
**Frontend Function**: `forgotPassword(payload)` - NEEDS UPDATE

**Current Issue**: Not properly implemented

**Request**:
```javascript
{
  "email": "john.doe@kab.ac.ug"
}
```

**Response - 200 OK** (always 200, regardless):
```javascript
{
  "message": "OTP sent to email if account exists",
  "detail": "Check your email for the OTP code. Valid for 1 hour."
}
```

**Mock Implementation** (update authApi.js):
```javascript
export const forgotPassword = async (payload) => {
  try {
    const response = await axiosClient.post('/auth/forgot-password', payload);
    return response.data;
  } catch (apiError) {
    await delay();
    // Always return 200 for security (don't reveal if email exists)
    // Backend will send OTP to email if account exists
    return {
      message: "OTP sent to email if account exists",
      detail: "Check your email for the OTP code. Valid for 1 hour."
    };
  }
};
```

**Frontend Behavior**:
- Always show message "Check your email for OTP"
- Don't tell user if email exists or not (security)
- Direct to reset password page after 2 seconds

---

### ⚠️ Endpoint 7: POST /auth/reset-password
**Frontend Function**: `resetPassword(payload)` - NEEDS UPDATE

**Request**:
```javascript
{
  "email": "john.doe@kab.ac.ug",
  "otp_code": "123456",
  "new_password": "NewPassword456",
  "confirm_password": "NewPassword456"
}
```

**Response - 200 OK**:
```javascript
{
  "message": "Password reset successfully. Please log in with your new password."
}
```

**Error - 400 Bad Request** (if OTP invalid/expired):
```javascript
{
  "detail": "Invalid or expired OTP code"
}
```

**Mock Implementation** (update authApi.js):
```javascript
export const resetPassword = async (payload) => {
  try {
    const response = await axiosClient.post('/auth/reset-password', payload);
    return response.data;
  } catch (apiError) {
    await delay();
    
    // Mock validation
    if (payload.otp_code !== "123456") {
      throw new Error("Invalid or expired OTP code");
    }
    
    if (payload.new_password !== payload.confirm_password) {
      throw new Error("Passwords do not match");
    }
    
    return {
      message: "Password reset successfully. Please log in with your new password."
    };
  }
};
```

---

## 🟢 PART 2: GENERAL ENDPOINTS (Reference Data)

### Endpoint 1: GET /general/faculties
**Frontend Function**: `getFaculties()` - CREATE NEW

**Request**: No body (public endpoint)
```bash
GET /api/v1/general/faculties
```

**Response - 200 OK**:
```javascript
[
  {
    "id": 1,
    "name": "Faculty of Computing and Informatics"
  },
  {
    "id": 2,
    "name": "Faculty of Medicine"
  },
  {
    "id": 3,
    "name": "Faculty of Engineering"
  },
  {
    "id": 4,
    "name": "Faculty of Business and Economics"
  },
  {
    "id": 5,
    "name": "Faculty of Science"
  }
]
```

**Mock Implementation** (create in referenceApi.js):
```javascript
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
```

**Where Used**:
- Registration form - faculty dropdown
- Proposal submission - PI faculty selector
- Team member form - faculty selector
- Admin users list - filter by faculty

---

### Endpoint 2: GET /general/departments
**Frontend Function**: `getDepartments(facultyId)` - CREATE NEW

**Request** (with optional query parameter):
```bash
GET /api/v1/general/departments?faculty_id=1
```

**Response - 200 OK**:
```javascript
[
  {
    "id": 101,
    "name": "Computer Science",
    "faculty_id": 1
  },
  {
    "id": 102,
    "name": "Information Technology",
    "faculty_id": 1
  },
  {
    "id": 103,
    "name": "Software Engineering",
    "faculty_id": 1
  }
]
```

**Mock Implementation** (create in referenceApi.js):
```javascript
export const getDepartments = async (facultyId = null) => {
  try {
    const params = facultyId ? { faculty_id: facultyId } : {};
    const response = await axiosClient.get('/general/departments', { params });
    return response.data;
  } catch (apiError) {
    await delay();
    
    const mockDepartments = [
      // Faculty 1
      { id: 101, name: "Computer Science", faculty_id: 1 },
      { id: 102, name: "Information Technology", faculty_id: 1 },
      { id: 103, name: "Software Engineering", faculty_id: 1 },
      // Faculty 2
      { id: 201, name: "General Medicine", faculty_id: 2 },
      { id: 202, name: "Paediatrics", faculty_id: 2 },
      // Faculty 3
      { id: 301, name: "Civil Engineering", faculty_id: 3 },
      { id: 302, name: "Electrical Engineering", faculty_id: 3 }
    ];
    
    if (facultyId) {
      return mockDepartments.filter(d => d.faculty_id === facultyId);
    }
    return mockDepartments;
  }
};
```

---

### Endpoint 3: GET /general/settings
**Frontend Function**: `getSystemSettings()` - CREATE NEW

**Request**: No body
```bash
GET /api/v1/general/settings
```

**Response - 200 OK**:
```javascript
{
  "id": 1,
  "system_name": "KAB Fund for Innovation and Research (KAB-FIR)",
  "system_motto": "Supporting research excellence and innovation",
  "address": "Kabale University, Kabale, Uganda",
  "email": "kabfir@kab.ac.ug",
  "phone": "+256-777-123-456",
  "active_academic_year": 2026,
  "submission_deadline": "2026-12-31",
  "is_accepting_applications": true,
  "system_logo_url": "https://res.cloudinary.com/kab-fir/image/upload/logo.png",
  "system_banner_url": "https://res.cloudinary.com/kab-fir/image/upload/banner.jpg"
}
```

**Data Fields**:
- `id` (integer) - Settings ID (usually 1)
- `system_name` (string) - Official system name
- `system_motto` (string) - System tagline
- `address` (string) - Physical address
- `email` (string) - Contact email
- `phone` (string) - Contact phone
- `active_academic_year` (integer) - Current academic year
- `submission_deadline` (string, ISO format) - Date when submissions close
- `is_accepting_applications` (boolean) - Whether submissions are open
- `system_logo_url` (string) - Logo URL
- `system_banner_url` (string) - Banner URL

**Business Logic**:
```javascript
// Check if submissions are closed
const isSubmissionClosed = () => {
  const settings = getSystemSettings(); // cache this
  if (!settings.is_accepting_applications) return true;
  
  const deadline = new Date(settings.submission_deadline);
  return new Date() > deadline;
};

// Use in applicant forms
if (isSubmissionClosed()) {
  showMessage("Submissions are currently closed");
  disableSubmitButton();
}
```

**Mock Implementation**:
```javascript
export const getSystemSettings = async () => {
  try {
    const response = await axiosClient.get('/general/settings');
    return response.data;
  } catch (apiError) {
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
```

---

## 🔴 PART 3: PROPOSAL ENDPOINTS

### Endpoint 1: POST /proposals
**Frontend Function**: `createProposal(payload)` - CREATE NEW

**Request Body**:
```javascript
{
  "grant_type": "Research",
  "title": "AI-Based Malaria Detection in Rural Uganda",
  "pi_first_name": "Jane",
  "pi_last_name": "Omondi",
  "pi_email": "j.omondi@kab.ac.ug",
  "pi_faculty_id": 1,
  "pi_department": "Computer Science",
  "total_budget": 15000000,
  "project_summary": "This research proposes an AI-driven diagnostic tool to detect malaria from blood samples...",
  "problem_statement": "Malaria remains a leading cause of death in Uganda, especially in rural areas...",
  "proposed_solution": "Deploy a mobile-based AI model trained on 10,000 samples...",
  "methods_description": "Mixed methods: dataset collection, model training, field testing...",
  "expected_outcomes": "Complete AI detection system with 95%+ accuracy",
  "implementation_timeline": "6 months",
  "sustainability_plan": "Establish research center at Kabale University",
  "risk_analysis": "Primary risks: data quality, adoption rate"
}
```

**Response - 201 Created**:
```javascript
{
  "id": 5,
  "protocol_no": "PR2026/PROPOSAL/005",
  "grant_type": "Research",
  "title": "AI-Based Malaria Detection in Rural Uganda",
  "status": "Draft",
  "academic_year": 2026,
  "pi_first_name": "Jane",
  "pi_last_name": "Omondi",
  "pi_email": "j.omondi@kab.ac.ug",
  "total_budget": 15000000,
  "attachments": [],
  "team_members": [],
  "created_by": 2,
  "created_at": "2026-05-25T10:00:00Z",
  "updated_at": "2026-05-25T10:00:00Z"
}
```

**Error Responses**:
```javascript
// 403 Forbidden (submissions closed)
{
  "detail": "Submissions are currently closed. Please try again during the next application window."
}

// 400 Bad Request (validation error)
{
  "detail": {
    "title": ["Title must be unique"],
    "total_budget": ["Budget must be greater than 0"]
  }
}
```

**Validation Rules** (Frontend):
- `grant_type`: required, enum: "Research" or "Innovation"
- `title`: required, 10-200 chars, must be unique per user per year
- `pi_first_name`: required, 2-50 chars
- `pi_last_name`: required, 2-50 chars
- `pi_email`: required, valid email
- `pi_faculty_id`: required, must exist in faculties
- `pi_department`: required, string
- `total_budget`: required, > 0, <= 50,000,000 UGX
- `project_summary`: required, max 200 words
- `problem_statement`: required, min 100 chars
- `proposed_solution`: required, min 100 chars
- `methods_description`: required, min 100 chars
- `expected_outcomes`: required, min 50 chars
- `implementation_timeline`: required, string
- `sustainability_plan`: required, min 50 chars
- `risk_analysis`: required, min 50 chars

**Mock Implementation** (applicantApi.js):
```javascript
let proposalCounter = 5; // Start at 5

export const createProposal = async (payload) => {
  try {
    const response = await axiosClient.post('/proposals', payload);
    return response.data;
  } catch (apiError) {
    await delay();
    
    // Mock: Check if submissions are closed
    const settings = await getSystemSettings();
    if (!settings.is_accepting_applications) {
      throw new Error("Submissions are currently closed");
    }
    
    // Mock: Check title uniqueness
    const proposals = JSON.parse(localStorage.getItem('kab_proposals') || '[]');
    if (proposals.some(p => p.title === payload.title)) {
      throw new Error("You already have a proposal with this title");
    }
    
    // Create new proposal
    const newProposal = {
      id: ++proposalCounter,
      protocol_no: `PR${settings.active_academic_year}/PROPOSAL/${proposalCounter.toString().padStart(3, '0')}`,
      ...payload,
      status: "Draft",
      academic_year: settings.active_academic_year,
      attachments: [],
      team_members: [],
      created_by: localStorage.getItem('currentUserId'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    proposals.push(newProposal);
    localStorage.setItem('kab_proposals', JSON.stringify(proposals));
    
    return newProposal;
  }
};
```

---

### Endpoint 2: GET /proposals/my
**Frontend Function**: `getMyProposals()` - CREATE NEW

**Request**: No body (uses Authorization header)
```bash
GET /api/v1/proposals/my
Authorization: Bearer {access_token}
```

**Response - 200 OK**:
```javascript
[
  {
    "id": 5,
    "protocol_no": "PR2026/PROPOSAL/005",
    "grant_type": "Research",
    "title": "AI-Based Malaria Detection in Rural Uganda",
    "status": "Draft",
    "total_budget": 15000000,
    "attachments_count": 0,
    "team_members_count": 1,
    "created_at": "2026-05-25T10:00:00Z",
    "updated_at": "2026-05-25T10:00:00Z"
  },
  {
    "id": 4,
    "protocol_no": "PR2026/PROPOSAL/004",
    "grant_type": "Innovation",
    "title": "Solar Water Purification System",
    "status": "Submitted",
    "total_budget": 8000000,
    "attachments_count": 9,
    "team_members_count": 2,
    "created_at": "2026-05-20T10:00:00Z",
    "updated_at": "2026-05-25T10:00:00Z"
  }
]
```

**Mock Implementation**:
```javascript
export const getMyProposals = async () => {
  try {
    const response = await axiosClient.get('/proposals/my');
    return response.data;
  } catch (apiError) {
    await delay();
    
    const userId = localStorage.getItem('currentUserId');
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
```

---

### Endpoint 3: GET /proposals/{id}
**Frontend Function**: `getProposalDetail(id)` - CREATE NEW

**Request**:
```bash
GET /api/v1/proposals/5
Authorization: Bearer {access_token}
```

**Response - 200 OK**:
```javascript
{
  "id": 5,
  "protocol_no": "PR2026/PROPOSAL/005",
  "grant_type": "Research",
  "title": "AI-Based Malaria Detection in Rural Uganda",
  "status": "Submitted",
  "academic_year": 2026,
  "total_budget": 15000000,
  "project_summary": "This research proposes an AI-driven diagnostic tool...",
  "problem_statement": "Malaria remains a leading cause of death...",
  "proposed_solution": "Deploy a mobile-based AI model...",
  "methods_description": "Mixed methods: dataset collection...",
  "expected_outcomes": "Complete AI detection system with 95%+ accuracy",
  "implementation_timeline": "6 months",
  "sustainability_plan": "Establish research center at Kabale University",
  "risk_analysis": "Primary risks: data quality, adoption rate",
  "pi_first_name": "Jane",
  "pi_last_name": "Omondi",
  "pi_email": "j.omondi@kab.ac.ug",
  "pi_faculty_id": 1,
  "pi_department": "Computer Science",
  "team_members": [
    {
      "id": 1,
      "first_name": "Paul",
      "last_name": "Kato",
      "qualification": "PhD",
      "designation": "Co-Investigator",
      "email": "p.kato@kab.ac.ug",
      "faculty_id": 1,
      "department": "Computer Science",
      "specialization": "AI/ML"
    }
  ],
  "attachments": [
    {
      "id": 1,
      "attachment_type": "Full Proposal Document",
      "file_name": "proposal_malaria_ai.pdf",
      "cloudinary_url": "https://res.cloudinary.com/...",
      "file_size": 2048000,
      "uploaded_at": "2026-05-23T12:00:00Z"
    },
    {
      "id": 2,
      "attachment_type": "Budget",
      "file_name": "budget_2026.xlsx",
      "cloudinary_url": "https://res.cloudinary.com/...",
      "file_size": 512000,
      "uploaded_at": "2026-05-23T13:00:00Z"
    }
  ],
  "created_by": 2,
  "created_at": "2026-05-23T10:00:00Z",
  "updated_at": "2026-05-25T10:00:00Z"
}
```

---

### Endpoint 4: POST /proposals/{id}/attachments
**Frontend Function**: `uploadAttachment(proposalId, file, attachmentType)` - CREATE NEW

**Request Format**: `multipart/form-data` (NOT JSON)
```
Content-Type: multipart/form-data

POST /api/v1/proposals/5/attachments
Authorization: Bearer {access_token}

Form Fields:
- attachment_type: "Budget"
- file: <binary file content>
```

**Allowed Attachment Types** (exactly 9):
1. "Full Proposal Document"
2. "Gantt Chart"
3. "Budget"
4. "National ID"
5. "Confirmation Letter"
6. "CVs"
7. "Consent Forms"
8. "Research Instruments"
9. "Faculty Support Evidence"

**File Constraints**:
- Types: PDF (.pdf), Word (.doc, .docx)
- Max size: 10MB
- Max files: 1 per attachment type

**Response - 201 Created**:
```javascript
{
  "id": 1,
  "attachment_type": "Budget",
  "file_name": "budget_2026.pdf",
  "cloudinary_url": "https://res.cloudinary.com/kab-fir/...",
  "file_size": 512000,
  "uploaded_at": "2026-05-25T15:30:00Z"
}
```

**Error - 400 Bad Request**:
```javascript
{
  "detail": "File too large. Maximum size is 10MB"
}

{
  "detail": "Invalid file type. Allowed: PDF, DOC, DOCX"
}
```

**Business Logic**:
- When all 9 attachment types uploaded → **auto-submit proposal** (change status to "Submitted")
- If duplicate type uploaded → replace old file with new
- Store file in Cloudinary (for production) or blob URL (for mock)

**Mock Implementation**:
```javascript
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
    await delay();
    
    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error("File too large. Maximum size is 10MB");
    }
    
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Invalid file type. Allowed: PDF, DOC, DOCX");
    }
    
    // Create blob URL for mock
    const blobUrl = URL.createObjectURL(file);
    
    // Update localStorage
    const proposals = JSON.parse(localStorage.getItem('kab_proposals') || '[]');
    const proposal = proposals.find(p => p.id === proposalId);
    
    if (!proposal) throw new Error("Proposal not found");
    
    // Replace if attachment type exists, otherwise add
    const attachmentIndex = proposal.attachments.findIndex(a => a.attachment_type === attachmentType);
    const newAttachment = {
      id: Date.now(),
      attachment_type: attachmentType,
      file_name: file.name,
      cloudinary_url: blobUrl,
      file_size: file.size,
      uploaded_at: new Date().toISOString()
    };
    
    if (attachmentIndex >= 0) {
      proposal.attachments[attachmentIndex] = newAttachment;
    } else {
      proposal.attachments.push(newAttachment);
    }
    
    // Check if all 9 types uploaded - if yes, auto-submit
    const requiredTypes = [
      "Full Proposal Document", "Gantt Chart", "Budget",
      "National ID", "Confirmation Letter", "CVs",
      "Consent Forms", "Research Instruments", "Faculty Support Evidence"
    ];
    
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
```

---

### Endpoint 5: POST /proposals/{id}/team-members
**Frontend Function**: `addTeamMember(proposalId, memberData)` - CREATE NEW

**Request Body**:
```javascript
{
  "first_name": "Paul",
  "last_name": "Kato",
  "qualification": "PhD",
  "gender": "Male",
  "designation": "Co-Investigator",
  "email": "p.kato@kab.ac.ug",
  "phone": "+256-123-456",
  "faculty_id": 1,
  "department": "Computer Science",
  "specialization": "AI/ML"
}
```

**Response - 201 Created**:
```javascript
{
  "id": 1,
  "first_name": "Paul",
  "last_name": "Kato",
  "qualification": "PhD",
  "designation": "Co-Investigator",
  "email": "p.kato@kab.ac.ug",
  "faculty_id": 1,
  "department": "Computer Science",
  "specialization": "AI/ML"
}
```

**Allowed Designations**:
- "Principal Investigator"
- "Co-Investigator"
- "Research Assistant"
- "Collaborator"

**Rules**:
- Max 10 team members per proposal
- Must have valid email
- Email domain can be external or @kab.ac.ug

---

### Endpoint 6: DELETE /proposals/{id}/team-members/{memberId}
**Frontend Function**: `removeTeamMember(proposalId, memberId)` - CREATE NEW

**Request**: No body
```bash
DELETE /api/v1/proposals/5/team-members/1
Authorization: Bearer {access_token}
```

**Response - 204 No Content**: (or 200 with success message)

---

### Endpoint 7: PATCH /proposals/{id}
**Frontend Function**: `updateProposal(proposalId, updates)` - CREATE NEW

**Rules**: Only editable if status is "Draft" or "Missing Attachments"

**Request** (any fields to update):
```javascript
{
  "title": "Updated Title",
  "project_summary": "Updated summary...",
  "total_budget": 20000000
}
```

**Response - 200 OK**: Updated proposal object

---

### Endpoint 8: DELETE /proposals/{id}
**Frontend Function**: `deleteProposal(proposalId)` - CREATE NEW

**Rules**: Only deletable if status is "Draft"

---

## 📊 SUMMARY TABLE: All Fields by Endpoint

| Endpoint | Method | Fields Required | Fields Optional | Status |
|----------|--------|-----------------|-----------------|--------|
| /proposals | POST | grant_type, title, pi_*, total_budget, project_summary, problem_statement, proposed_solution, methods_description, expected_outcomes, implementation_timeline, sustainability_plan, risk_analysis | | ❌ MISSING |
| /proposals/my | GET | (none) | | ❌ MISSING |
| /proposals/{id} | GET | (none) | | ❌ MISSING |
| /proposals/{id}/attachments | POST | attachment_type, file | | ❌ MISSING |
| /proposals/{id}/team-members | POST | first_name, last_name, qualification, designation, email, faculty_id, department | gender, phone, specialization | ❌ MISSING |
| /proposals/{id}/team-members/{memberId} | DELETE | (none) | | ❌ MISSING |
| /proposals/{id} | PATCH | (all optional) | | ❌ MISSING |
| /proposals/{id} | DELETE | (none) | | ❌ MISSING |

---

## ✅ IMPLEMENTATION CHECKLIST

**For Backend Partner** (must implement these data structures):

- [ ] All 9 Attachment Type fields standardized
- [ ] Proposal Status enum: Draft, Missing Attachments, Submitted, Scheduled for Review, Reviewed, Approved, Rejected, Awarded
- [ ] Team Member Designation enum: Principal Investigator, Co-Investigator, Research Assistant, Collaborator
- [ ] Grant Type enum: Research, Innovation
- [ ] Automatic proposal submission when all 9 attachments uploaded
- [ ] One-time use OTP validation for password reset
- [ ] Multipart/form-data file upload handling
- [ ] Cloudinary or S3 integration for file storage
- [ ] Protocol number generation: `PR{YEAR}/PROPOSAL/{ID}`

---

**Date Created**: May 25, 2026  
**Last Updated**: May 25, 2026  
**Version**: 1.0
