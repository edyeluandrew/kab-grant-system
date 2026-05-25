# 🔴 API ANALYSIS: Missing Endpoints & Field Discrepancies
## Backend API Reference vs Current Frontend Implementation

**Date**: May 25, 2026  
**Backend API Version**: v1.0.0 (Production: https://kabfir-api.onrender.com/api/v1)  
**Current Frontend Status**: Incomplete - Mock data only

---

## 📊 SUMMARY

| Category | Status | Implemented | Missing | Priority |
|----------|--------|-------------|---------|----------|
| **Auth Endpoints** | ⚠️ PARTIAL | 5/7 | 2 | 🔴 HIGH |
| **General Endpoints** | ❌ MISSING | 0/8 | 8 | 🔴 HIGH |
| **Proposal Endpoints** | ❌ MISSING | 0/8 | 8 | 🔴 HIGH |
| **Admin Endpoints** | ✅ GOOD | 13/14 | 1 | 🟠 MEDIUM |
| **Reviewer Endpoints** | ✅ GOOD | 4/4 | 0 | ✅ DONE |
| **Grant Calls** | ⚠️ CUSTOM | 6/6 | 0 | N/A |

---

## 🔴 SECTION 1: MISSING AUTH ENDPOINTS (2/7)

### Missing Endpoint #1: POST /auth/forgot-password
**Status**: ❌ MISSING (exists but incomplete)
**What it does**: Send OTP reset code to user's email
**Current Status**: Basic mock exists but doesn't match spec

**Expected Request**:
```json
{
  "email": "user@kab.ac.ug"
}
```

**Expected Response - 200 OK**:
```json
{
  "message": "OTP sent to email if account exists",
  "detail": "Always returns 200 regardless (prevents email enumeration)"
}
```

**What Backend Expects**:
- Field: `email` (string, required)
- Response: Always 200 (security measure - don't reveal if email exists)
- OTP valid for: 1 hour
- OTP format: 6 digits

**Current Implementation**: ⚠️ Exists but incomplete
**Action Needed**: ✅ Enhance with proper error handling

---

### Missing Endpoint #2: POST /auth/reset-password
**Status**: ❌ MISSING (exists but incomplete)
**What it does**: Reset password using OTP code

**Expected Request**:
```json
{
  "email": "user@kab.ac.ug",
  "otp_code": "123456",
  "new_password": "newpass123",
  "confirm_password": "newpass123"
}
```

**Expected Response - 200 OK**:
```json
{
  "message": "Password reset successfully. Please log in."
}
```

**What Backend Expects**:
- `email` (string, required) - Account email
- `otp_code` (string, required) - 6-digit code from email
- `new_password` (string, required) - Min 8 characters
- `confirm_password` (string, required) - Must match new_password
- OTP valid for: 1 hour, one-time use only
- After reset: User must log in again

**Current Implementation**: ⚠️ Exists but incomplete
**Action Needed**: ✅ Complete with OTP validation

---

## ❌ SECTION 2: COMPLETELY MISSING - GENERAL ENDPOINTS (0/8)

These endpoints provide reference data for forms and are **PUBLIC** (no auth required).

### Missing Endpoint #1: GET /general/faculties
**Status**: ❌ COMPLETELY MISSING
**What it does**: List all active faculties for registration form dropdown

**Request**: No body
```bash
GET /api/v1/general/faculties
```

**Expected Response - 200 OK**:
```json
[
  { "id": 1, "name": "Faculty of Computing and Informatics" },
  { "id": 2, "name": "Faculty of Medicine" },
  { "id": 3, "name": "Faculty of Engineering" },
  { "id": 4, "name": "Faculty of Business and Economics" },
  { "id": 5, "name": "Faculty of Science" }
]
```

**Data Fields**:
- `id` (integer) - Faculty identifier
- `name` (string) - Faculty display name

**Where Used**: 
- Registration form - Faculty dropdown
- Proposal creation - PI Faculty selection
- Team member form - Faculty selection

**Priority**: 🔴 CRITICAL
**Mock Data Needed**: At least 5 faculties

---

### Missing Endpoint #2: GET /general/departments
**Status**: ❌ COMPLETELY MISSING
**What it does**: List departments, optionally filtered by faculty

**Request with Query Parameter**:
```bash
GET /api/v1/general/departments?faculty_id=1
```

**Expected Response - 200 OK**:
```json
[
  { "id": 101, "name": "Computer Science", "faculty_id": 1 },
  { "id": 102, "name": "Information Technology", "faculty_id": 1 },
  { "id": 103, "name": "Software Engineering", "faculty_id": 1 }
]
```

**Data Fields**:
- `id` (integer) - Department identifier
- `name` (string) - Department name
- `faculty_id` (integer) - Parent faculty ID

**Query Parameters**:
- `faculty_id` (integer, optional) - Filter by faculty

**Where Used**:
- Registration form - Department dropdown (filters based on selected faculty)
- Proposal creation - PI Department selection
- Staff profile - Department

**Priority**: 🔴 CRITICAL
**Mock Data Needed**: 3-5 departments per faculty

---

### Missing Endpoint #3: GET /general/settings
**Status**: ❌ COMPLETELY MISSING
**What it does**: Get system-wide configuration

**Request**: No body
```bash
GET /api/v1/general/settings
```

**Expected Response - 200 OK**:
```json
{
  "id": 1,
  "system_name": "KAB Fund for Innovation and Research (KAB-FIR)",
  "system_motto": "Supporting research excellence and innovation",
  "address": "Kabale, Uganda",
  "email": "kabfir@kab.ac.ug",
  "phone": "+256-777-123-456",
  "active_academic_year": 2026,
  "submission_deadline": "2026-12-31",
  "is_accepting_applications": true,
  "system_logo_url": "https://...",
  "system_banner_url": "https://..."
}
```

**Data Fields**:
- `id` (integer)
- `system_name` (string) - Display name
- `system_motto` (string) - System tagline
- `address` (string) - Physical address
- `email` (string) - Contact email
- `phone` (string) - Contact phone
- `active_academic_year` (integer) - e.g., 2026
- `submission_deadline` (date string) - Format: YYYY-MM-DD
- `is_accepting_applications` (boolean) - Whether submissions are open
- `system_logo_url` (string, optional) - Logo URL
- `system_banner_url` (string, optional) - Banner URL

**Business Logic**:
- If `is_accepting_applications` is false → Hide "Submit Proposal" button
- If current date > `submission_deadline` → Block proposal submissions
- `active_academic_year` → Only allow proposals for current year

**Where Used**:
- Landing page - Show system name, motto, info
- Before showing submit proposal form - Check deadline & is_accepting_applications
- Admin settings page

**Priority**: 🔴 CRITICAL
**Mock Data Needed**: Yes - 1 settings object

---

### Missing Endpoint #4: POST /general/faculties (Admin only)
**Status**: ❌ MISSING
**What it does**: Create new faculty (admin only)

**Request**:
```json
{
  "name": "Faculty of Law"
}
```

**Expected Response - 201 Created**:
```json
{
  "id": 6,
  "name": "Faculty of Law"
}
```

**Priority**: 🟠 MEDIUM (admin feature, not critical for MVP)

---

### Missing Endpoint #5: DELETE /general/faculties/{id} (Admin only)
**Status**: ❌ MISSING
**What it does**: Deactivate a faculty

**Priority**: 🟠 MEDIUM (admin feature)

---

### Missing Endpoint #6: POST /general/departments (Admin only)
**Status**: ❌ MISSING
**What it does**: Create new department

**Priority**: 🟠 MEDIUM (admin feature)

---

### Missing Endpoint #7: DELETE /general/departments/{id} (Admin only)
**Status**: ❌ MISSING
**What it does**: Deactivate department

**Priority**: 🟠 MEDIUM (admin feature)

---

### Missing Endpoint #8: PATCH /general/settings (Admin only)
**Status**: ❌ MISSING
**What it does**: Update system settings

**Request** (all fields optional):
```json
{
  "system_name": "Updated Name",
  "submission_deadline": "2026-12-31",
  "is_accepting_applications": false,
  "active_academic_year": 2027
}
```

**Priority**: 🟠 MEDIUM (admin feature)

---

## ❌ SECTION 3: COMPLETELY MISSING - PROPOSAL ENDPOINTS (0/8)

These are **CORE** functionality - applicants use these to submit proposals.

### Missing Endpoint #1: POST /proposals
**Status**: ❌ COMPLETELY MISSING
**What it does**: Create new proposal (saves as Draft)

**Request Body** (multipart/form-data if files included):
```json
{
  "grant_type": "Research",
  "title": "AI-Based Malaria Detection in Rural Uganda",
  "pi_first_name": "Jane",
  "pi_last_name": "Omondi",
  "pi_email": "j.omondi@kab.ac.ug",
  "pi_faculty_id": 1,
  "pi_department": "Computer Science",
  "total_budget": 15000000,
  "project_summary": "This research proposes an AI-driven diagnostic tool...",
  "problem_statement": "Malaria remains a leading cause of death...",
  "proposed_solution": "Deploy a mobile-based AI model...",
  "methods_description": "Mixed methods: dataset collection...",
  "expected_outcomes": "...",
  "implementation_timeline": "6 months",
  "sustainability_plan": "...",
  "risk_analysis": "..."
}
```

**Expected Response - 201 Created**:
```json
{
  "id": 5,
  "protocol_no": "PR2026/PROPOSAL/005",
  "grant_type": "Research",
  "title": "AI-Based Malaria Detection",
  "status": "Draft",
  "academic_year": 2026,
  "attachments": [],
  "team_members": [],
  "created_at": "2026-05-23T10:00:00Z"
}
```

**Business Rules**:
- Title must be unique per user per year
- Checks: `is_accepting_applications` must be true
- Checks: current date must be before `submission_deadline`
- If not met: return 403 "Submissions are closed"
- Status starts as "Draft"

**Data Fields Required**:
- `grant_type` - enum: "Research" or "Innovation"
- `title` - string
- `pi_first_name`, `pi_last_name` - strings
- `pi_email` - valid email
- `pi_faculty_id` - integer (from /general/faculties)
- `pi_department` - string
- `total_budget` - decimal (UGX)
- `project_summary` - string (max 200 words)
- `problem_statement` - string
- `proposed_solution` - string
- `methods_description` - string
- + more fields (see section 4.4 of backend docs)

**Priority**: 🔴 CRITICAL

---

### Missing Endpoint #2: GET /proposals/my
**Status**: ❌ COMPLETELY MISSING
**What it does**: Get all proposals for the logged-in applicant/staff

**Request**:
```bash
GET /api/v1/proposals/my
Authorization: Bearer {access_token}
```

**Expected Response - 200 OK**:
```json
[
  {
    "id": 5,
    "protocol_no": "PR2026/PROPOSAL/005",
    "grant_type": "Research",
    "title": "AI-Based Malaria Detection",
    "status": "Draft",
    "total_budget": 15000000,
    "created_at": "2026-05-23T10:00:00Z",
    "attachments": [...]
  }
]
```

**Where Used**: "My Proposals" page

**Priority**: 🔴 CRITICAL

---

### Missing Endpoint #3: GET /proposals/{id}
**Status**: ❌ COMPLETELY MISSING
**What it does**: Get single proposal details

**Request**:
```bash
GET /api/v1/proposals/5
Authorization: Bearer {access_token}
```

**Expected Response - 200 OK**:
```json
{
  "id": 5,
  "protocol_no": "PR2026/PROPOSAL/005",
  "grant_type": "Research",
  "title": "AI-Based Malaria Detection",
  "status": "Submitted",
  "total_budget": 15000000,
  "project_summary": "...",
  "problem_statement": "...",
  "proposed_solution": "...",
  "methods_description": "...",
  "team_members": [
    {
      "id": 1,
      "first_name": "Paul",
      "last_name": "Kato",
      "qualification": "PhD",
      "designation": "Co-Investigator",
      "email": "p.kato@kab.ac.ug"
    }
  ],
  "attachments": [
    {
      "id": 1,
      "attachment_type": "Full Proposal Document",
      "file_name": "proposal_malaria_ai.pdf",
      "cloudinary_url": "https://res.cloudinary.com/...",
      "uploaded_at": "2026-05-23T12:00:00Z"
    }
  ],
  "created_at": "2026-05-23T10:00:00Z"
}
```

**Who Can Access**:
- Staff: their own proposals only
- Admin: all proposals
- Reviewer: proposals assigned to them only

**Priority**: 🔴 CRITICAL

---

### Missing Endpoint #4: PATCH /proposals/{id}
**Status**: ❌ COMPLETELY MISSING
**What it does**: Update a draft proposal

**Rules**: Only possible if status is "Draft" or "Missing Attachments"

**Request Body** (any fields to update):
```json
{
  "title": "Updated Title",
  "project_summary": "Updated summary..."
}
```

**Priority**: 🔴 CRITICAL

---

### Missing Endpoint #5: DELETE /proposals/{id}
**Status**: ❌ COMPLETELY MISSING
**What it does**: Delete a draft proposal

**Rules**: Only possible if status is "Draft"

**Priority**: 🟠 MEDIUM

---

### Missing Endpoint #6: POST /proposals/{id}/attachments
**Status**: ❌ COMPLETELY MISSING
**What it does**: Upload attachment file

**Request Format**: multipart/form-data (NOT JSON)
```
attachment_type: "Budget"
file: <PDF or Word file, max 10MB>
```

**Allowed Attachment Types** (exactly 9 required):
1. "Full Proposal Document"
2. "Gantt Chart"
3. "Budget"
4. "National ID"
5. "Confirmation Letter"
6. "CVs"
7. "Consent Forms"
8. "Research Instruments"
9. "Faculty Support Evidence"

**Expected Response - 201 Created**:
```json
{
  "id": 23,
  "attachment_type": "Budget",
  "file_name": "budget_2026.pdf",
  "cloudinary_url": "https://res.cloudinary.com/...",
  "uploaded_at": "2026-05-23T12:00:00Z"
}
```

**Business Logic**:
- File types allowed: .pdf, .doc, .docx
- Max file size: 10MB
- If duplicate type uploaded: replace the old one
- When all 9 types uploaded: proposal auto-submits (status changes to "Submitted")

**Priority**: 🔴 CRITICAL

---

### Missing Endpoint #7: POST /proposals/{id}/team-members
**Status**: ❌ COMPLETELY MISSING
**What it does**: Add co-investigator/team member

**Request Body**:
```json
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

**Expected Response - 201 Created**:
```json
{
  "id": 1,
  "first_name": "Paul",
  "last_name": "Kato",
  "qualification": "PhD",
  "designation": "Co-Investigator",
  "email": "p.kato@kab.ac.ug"
}
```

**Rules**: Only possible if proposal is in Draft or Missing Attachments status

**Priority**: 🔴 CRITICAL

---

### Missing Endpoint #8: DELETE /proposals/{id}/team-members/{memberId}
**Status**: ❌ COMPLETELY MISSING
**What it does**: Remove a team member from proposal

**Priority**: 🔴 CRITICAL

---

## 🟠 SECTION 4: PARTIALLY IMPLEMENTED - ADMIN ENDPOINTS (13/14)

### Missing Endpoint: GET /admin/proposals/awarded
**Status**: ✅ IMPLEMENTED (already have it - good!)

**But Need to Verify**:
```bash
GET /api/v1/admin/proposals/awarded
```

All admin endpoints seem well covered. ✅

---

## ✅ SECTION 5: COMPLETE - REVIEWER ENDPOINTS (4/4)

All reviewer endpoints are implemented ✅:
- ✅ GET /reviewer/proposals
- ✅ GET /reviewer/proposals/{id}
- ✅ POST /reviewer/proposals/{id}/review
- ✅ GET /reviewer/my-reviews

**Note**: Verify multipart/form-data handling for review submission ✅

---

## 🔵 SECTION 6: CUSTOM ADDITIONS (Grant Calls Management)

These are **NOT** in the backend API reference but are implemented in frontend:
- getGrantCalls()
- createGrantCall()
- updateGrantCall()
- openApplicationWindow()
- closeApplicationWindow()
- deleteGrantCall()

**Status**: These may be custom for your implementation. **Clarify with backend partner** if they should be:
1. Built into the backend
2. Merged into the general/settings endpoint
3. Or kept as separate custom endpoint

---

## 🚨 CRITICAL ACTION ITEMS

### Priority 1 - IMPLEMENT IMMEDIATELY (🔴 RED)

```
1. ❌ GET /general/faculties - Mock data with 5 faculties
2. ❌ GET /general/departments - Mock data with departments per faculty  
3. ❌ GET /general/settings - Mock data with system configuration
4. ❌ POST /proposals - Create proposal endpoint
5. ❌ GET /proposals/my - Get user's proposals
6. ❌ GET /proposals/{id} - Get proposal details
7. ❌ POST /proposals/{id}/attachments - Upload attachments (MULTIPART!)
8. ❌ POST /proposals/{id}/team-members - Add team members
9. ❌ DELETE /proposals/{id}/team-members/{memberId} - Remove team members
10. ❌ PATCH /proposals/{id} - Update draft proposals
```

**Time Estimate**: 8-10 hours for backend partner to implement

---

## 📝 FIELD DISCREPANCIES TO FIX

### Issue #1: Role Values
**Backend Spec Says**: `"staff"`, `"reviewer"`, `"admin"`
**Current Frontend**: Also uses `"staff"`, `"reviewer"`, and extra values like `"super_admin"`, `"sgo_admin"`

**Action**: Clarify with backend if custom role mapping is needed

### Issue #2: Proposal Status Values
**Backend Spec**:
```
"Draft"
"Missing Attachments"
"Submitted"
"Scheduled for Review"
"Reviewed"
"Approved"
"Rejected"
"Awarded"
```

**Current Frontend**: Verify all these match in mock data

### Issue #3: Recommendation Values for Reviews
**Backend Spec**:
```
"Approve"
"Minor Revisions"
"Major Revisions"
"Reject"
```

**Current Frontend**: ✅ Already matches (good!)

---

## 📋 DATA STRUCTURE UPDATES NEEDED

### User Object Alignment
**Backend Returns**:
```json
{
  "id": 1,
  "first_name": "Jane",
  "surname": "Omondi",
  "email": "j.omondi@kab.ac.ug",
  "role": "staff",
  "is_active": true,
  "created_at": "2026-05-23T10:00:00Z"
}
```

**Frontend Currently Has**: ⚠️ Extra fields like `other_name`, custom roles

**Action**: Standardize to match backend spec

---

## 🔗 QUICK REFERENCE: ENDPOINT CHECKLIST

### Auth (5/7) - 71% Complete ✅
- [x] POST /auth/register
- [x] POST /auth/login
- [x] POST /auth/refresh
- [x] GET /auth/me
- [x] POST /auth/change-password
- [ ] POST /auth/forgot-password (incomplete)
- [ ] POST /auth/reset-password (incomplete)

### General (0/8) - 0% Complete ❌
- [ ] GET /general/faculties
- [ ] POST /general/faculties
- [ ] DELETE /general/faculties/{id}
- [ ] GET /general/departments
- [ ] POST /general/departments
- [ ] DELETE /general/departments/{id}
- [ ] GET /general/settings
- [ ] PATCH /general/settings

### Proposals (0/8) - 0% Complete ❌
- [ ] POST /proposals
- [ ] GET /proposals/my
- [ ] GET /proposals/{id}
- [ ] PATCH /proposals/{id}
- [ ] DELETE /proposals/{id}
- [ ] POST /proposals/{id}/attachments
- [ ] POST /proposals/{id}/team-members
- [ ] DELETE /proposals/{id}/team-members/{memberId}

### Admin (13/14) - 93% Complete ✅
- [x] GET /admin/dashboard
- [x] GET /admin/users
- [x] PATCH /admin/users/{id}/deactivate
- [x] PATCH /admin/users/{id}/activate
- [x] POST /admin/reviewers
- [x] GET /admin/reviewers
- [x] DELETE /admin/reviewers/{id}
- [x] GET /admin/proposals/submitted
- [x] GET /admin/proposals/scheduled
- [x] GET /admin/proposals/reviewed
- [x] GET /admin/proposals/approved
- [x] GET /admin/proposals/rejected
- [x] GET /admin/proposals/awarded
- [x] GET /admin/proposals/{id}
- [x] POST /admin/proposals/{id}/assign-reviewers
- [x] DELETE /admin/proposals/{id}/reviewers/{revId}
- [x] POST /admin/proposals/{id}/decision

### Reviewer (4/4) - 100% Complete ✅
- [x] GET /reviewer/proposals
- [x] GET /reviewer/proposals/{id}
- [x] POST /reviewer/proposals/{id}/review
- [x] GET /reviewer/my-reviews

---

## 📧 COMMUNICATION WITH BACKEND PARTNER

**Send them this message**:

> Dear Backend Partner,
>
> We've completed the frontend implementation and reviewed your API specification. Here are the endpoints we need from you:
>
> **CRITICAL (needed immediately)**:
> 1. GET /general/faculties
> 2. GET /general/departments
> 3. GET /general/settings
> 4. POST /proposals
> 5. GET /proposals/my
> 6. GET /proposals/{id}
> 7. POST /proposals/{id}/attachments (multipart/form-data)
> 8. POST /proposals/{id}/team-members
> 9. DELETE /proposals/{id}/team-members/{memberId}
> 10. PATCH /proposals/{id}
>
> **QUESTIONS**:
> - Should the Grant Calls management be merged into your API?
> - Are custom roles (super_admin, sgo_admin) supported or should we stick to basic roles?
> - For multipart/form-data endpoints, should the form field for the file be named "file"?
>
> **Timeline**: We're ready to integrate once you implement these endpoints.
>
> Thanks!

---

## 🎯 NEXT STEPS FOR YOUR TEAM

1. **Share this document with backend partner** - They need to implement 16 missing endpoints
2. **Clarify Grant Calls** - Are these backend endpoints or just frontend feature?
3. **Standardize roles** - Confirm which role values are valid
4. **Test multipart uploads** - Ensure file upload endpoints work correctly
5. **Mock data for testing** - Create realistic mock data for all missing endpoints

---

**Document Version**: 1.0  
**Last Updated**: May 25, 2026  
**Status**: Ready for backend implementation
