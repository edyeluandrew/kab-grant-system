# 📊 EXECUTIVE SUMMARY: Backend API Requirements
## Frontend Audit Results & Integration Checklist

**Date**: May 25, 2026  
**To**: Backend Development Partner  
**From**: Frontend Team  
**Status**: Ready for backend implementation  

---

## 🎯 QUICK FACTS

| Metric | Value |
|--------|-------|
| **Total Endpoints Needed** | 24 |
| **Already Implemented in Backend Spec** | 17 |
| **Missing & Needed** | **16** |
| **Frontend Readiness** | 85% |
| **Backend Readiness** | 40% |
| **Go-Live Blocker** | Missing 16 endpoints |

---

## 🔴 CRITICAL MISSING (Must Implement Now)

### 1. General Reference Data Endpoints (3 endpoints)
These provide system configuration and form dropdowns - **BLOCKING all forms**.

```
✗ GET /general/faculties
✗ GET /general/departments  
✗ GET /general/settings
```

**Impact**: Registration, proposal creation, and team member forms all blocked until implemented.

**Timeline**: 2 hours to implement + test

---

### 2. Proposal Management Core (8 endpoints)
These are **critical** - applicants cannot submit proposals without these.

```
✗ POST /proposals                              → Create proposal (Draft)
✗ GET /proposals/my                            → List user's proposals
✗ GET /proposals/{id}                          → Get proposal details
✗ PATCH /proposals/{id}                        → Update draft proposal
✗ DELETE /proposals/{id}                       → Delete draft proposal
✗ POST /proposals/{id}/attachments             → Upload files (multipart!)
✗ POST /proposals/{id}/team-members            → Add co-investigators
✗ DELETE /proposals/{id}/team-members/{memberId} → Remove team member
```

**Impact**: Without these, applicants cannot submit any proposals. Zero proposal submissions.

**Timeline**: 6-8 hours to implement fully

---

## 🟡 IMPORTANT (Implement Soon)

### Auth Endpoints - Enhancement (2 endpoints)

These exist in spec but need refinement:

```
⚠️ POST /auth/forgot-password  → Needs OTP generation & email sending
⚠️ POST /auth/reset-password   → Needs OTP validation & password reset
```

**Impact**: Password reset flow currently blocked.

**Timeline**: 2-3 hours

---

## ✅ COMPLETE (No action needed)

### Admin Endpoints (17 endpoints) - ✅ DONE

```
✓ GET /admin/dashboard
✓ GET /admin/users
✓ PATCH /admin/users/{id}/deactivate
✓ PATCH /admin/users/{id}/activate
✓ POST /admin/reviewers
✓ GET /admin/reviewers
✓ DELETE /admin/reviewers/{id}
✓ GET /admin/proposals/submitted
✓ GET /admin/proposals/scheduled
✓ GET /admin/proposals/reviewed
✓ GET /admin/proposals/approved
✓ GET /admin/proposals/rejected
✓ GET /admin/proposals/awarded
✓ GET /admin/proposals/{id}
✓ POST /admin/proposals/{id}/assign-reviewers
✓ DELETE /admin/proposals/{id}/reviewers/{revId}
✓ POST /admin/proposals/{id}/decision
```

**Admin functionality**: ✅ Ready

### Reviewer Endpoints (4 endpoints) - ✅ DONE

```
✓ GET /reviewer/proposals
✓ GET /reviewer/proposals/{id}
✓ POST /reviewer/proposals/{id}/review
✓ GET /reviewer/my-reviews
```

**Reviewer functionality**: ✅ Ready

---

## 📋 REQUIRED DATA STRUCTURES

### 1. System Settings Object
```json
{
  "id": 1,
  "system_name": "KAB Fund for Innovation and Research",
  "submission_deadline": "2026-12-31",
  "is_accepting_applications": true,
  "active_academic_year": 2026
}
```

**Business Logic**:
- If `is_accepting_applications` = false → block new proposals
- If current_date > `submission_deadline` → block new proposals
- Compare `active_academic_year` when filtering proposals

---

### 2. Proposal Status Enum
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

**Transitions**:
- Draft → Missing Attachments (when form complete)
- Missing Attachments → Submitted (when all 9 attachments uploaded)
- Submitted → Scheduled for Review (when admin assigns reviewers)
- Scheduled for Review → Reviewed (when all reviews submitted)
- Reviewed → Approved/Rejected/Awarded (admin decision)

---

### 3. Attachment Types (Exactly 9 required)
```
1. "Full Proposal Document" (PDF/Word)
2. "Gantt Chart" (PDF/Word)
3. "Budget" (PDF/Word)
4. "National ID" (PDF/Word)
5. "Confirmation Letter" (PDF/Word)
6. "CVs" (PDF/Word)
7. "Consent Forms" (PDF/Word)
8. "Research Instruments" (PDF/Word)
9. "Faculty Support Evidence" (PDF/Word)
```

**Auto-Submit Logic**:
- When **all 9 types** uploaded → automatically change proposal status to "Submitted"
- If duplicate type uploaded → replace previous file
- File upload must be multipart/form-data (not JSON)

---

### 4. Proposal Object Structure
```javascript
{
  "id": 5,
  "protocol_no": "PR2026/PROPOSAL/005",
  "grant_type": "Research",  // or "Innovation"
  "title": "...",
  "status": "Submitted",
  "academic_year": 2026,
  "total_budget": 15000000,
  "project_summary": "...",
  "problem_statement": "...",
  "proposed_solution": "...",
  "methods_description": "...",
  "expected_outcomes": "...",
  "implementation_timeline": "...",
  "sustainability_plan": "...",
  "risk_analysis": "...",
  "pi_first_name": "Jane",
  "pi_last_name": "Omondi",
  "pi_email": "j.omondi@kab.ac.ug",
  "pi_faculty_id": 1,
  "pi_department": "Computer Science",
  "team_members": [...],
  "attachments": [...],
  "created_by": 2,
  "created_at": "2026-05-25T10:00:00Z",
  "updated_at": "2026-05-25T10:00:00Z"
}
```

---

### 5. Team Member Object
```javascript
{
  "id": 1,
  "first_name": "Paul",
  "last_name": "Kato",
  "qualification": "PhD",
  "designation": "Co-Investigator",  // or: Research Assistant, Collaborator
  "email": "p.kato@kab.ac.ug",
  "phone": "+256-...",
  "faculty_id": 1,
  "department": "Computer Science",
  "specialization": "AI/ML"
}
```

---

### 6. Attachment Object
```javascript
{
  "id": 1,
  "attachment_type": "Budget",
  "file_name": "budget_2026.pdf",
  "cloudinary_url": "https://res.cloudinary.com/...",
  "file_size": 512000,
  "uploaded_at": "2026-05-25T12:00:00Z"
}
```

---

## 🔧 TECHNICAL REQUIREMENTS

### 1. File Upload Handling
- **Format**: multipart/form-data (NOT JSON)
- **Max file size**: 10MB per file
- **Allowed types**: .pdf, .doc, .docx
- **Storage**: Cloudinary (recommended) or AWS S3
- **Form field names**: 
  - `attachment_type` (string)
  - `file` (binary file)

### 2. OTP Implementation
- **Format**: 6-digit numeric code
- **Validity**: 1 hour
- **Delivery**: Email
- **Usage**: One-time use only (invalidate after reset)

### 3. Error Handling Standards
```javascript
// All endpoints should return consistent error format:

// 400 Bad Request (validation error)
{
  "detail": {
    "field_name": ["error message"],
    "another_field": ["multiple", "errors"]
  }
}

// 403 Forbidden (permission/business logic)
{
  "detail": "Submissions are currently closed"
}

// 404 Not Found
{
  "detail": "Proposal not found"
}
```

---

## 📊 IMPLEMENTATION PRIORITY & TIMELINE

### Phase 1 (Week 1) - CRITICAL PATH
```
Priority: HIGHEST
Time: 6-8 hours

1. GET /general/faculties (2h)
2. GET /general/departments (2h)
3. GET /general/settings (2h)
4. POST /proposals (2h)
5. GET /proposals/my (1h)
6. GET /proposals/{id} (1h)

Cumulative: 6-8 hours
Blocker Removal: Yes - enables proposal creation UI
```

### Phase 2 (Week 1) - PROPOSAL SUBMISSION
```
Priority: CRITICAL
Time: 8-10 hours

7. POST /proposals/{id}/attachments - MULTIPART! (3h)
8. POST /proposals/{id}/team-members (2h)
9. DELETE /proposals/{id}/team-members/{memberId} (1h)
10. PATCH /proposals/{id} (2h)
11. DELETE /proposals/{id} (1h)

Cumulative: 8-10 hours
Blocker Removal: Yes - enables full proposal submission
Auto-submit Logic: When all 9 attachments uploaded
```

### Phase 3 (Week 2) - AUTHENTICATION
```
Priority: HIGH
Time: 2-3 hours

12. POST /auth/forgot-password (2h)
13. POST /auth/reset-password (1h)

Blocker Removal: Yes - enables password reset
```

**TOTAL IMPLEMENTATION TIME: 16-21 hours**

---

## 🚀 FRONTEND READINESS STATUS

✅ **Admin Dashboard**: Ready  
✅ **Reviewer Interface**: Ready  
✅ **Grant Calls Management**: Ready  
❌ **Applicant Proposal Submission**: Blocked (waiting for 16 endpoints)  
❌ **User Registration**: Blocked (missing faculties/departments)  
❌ **Password Reset**: Blocked (missing OTP endpoints)  

---

## 📞 INTEGRATION CHECKLIST

**For Backend Partner**:

- [ ] Implement 16 missing endpoints (estimated 16-21 hours)
- [ ] Implement OTP system for forgot/reset password
- [ ] Implement multipart/form-data file upload for attachments
- [ ] Implement Cloudinary or S3 integration for file storage
- [ ] Implement protocol number generation: `PR{YEAR}/PROPOSAL/{ID}`
- [ ] Implement auto-submit logic when all 9 attachments uploaded
- [ ] Implement status transition validation
- [ ] Return all fields in exact names and types specified
- [ ] Add error handling as specified
- [ ] Test all endpoints with frontend mock data

**For Frontend Team**:

- [ ] Update 2 auth endpoints to handle OTP
- [ ] Add 3 reference data functions
- [ ] Add 8 proposal management functions
- [ ] Test all new endpoints against backend
- [ ] Update UI components to handle error responses
- [ ] Implement file upload progress indicators
- [ ] Cache system settings and faculties locally

---

## 📝 QUESTIONS FOR BACKEND PARTNER

1. **Multipart Upload**: Should file field name be "file" or something else?
2. **Protocol Numbers**: Should these be auto-generated or provided by frontend?
3. **File Storage**: Will you use Cloudinary? Should frontend send files there directly or through backend?
4. **OTP Length**: Confirmed 6 digits? Should it be alphanumeric?
5. **Grant Calls**: Are these separate backend endpoints or part of general settings?
6. **Email Validation**: Should we validate domain @kab.ac.ug on backend?
7. **Academic Year**: Should this auto-increment annually or be set via admin?
8. **Submission Deadline**: Can admin change this in real-time or is it fixed per academic year?

---

## 📧 NEXT STEPS

**Immediate** (This week):
1. Share this document with backend team
2. Get confirmation on technical requirements above
3. Backend starts implementing Phase 1 endpoints
4. Frontend finalizes form components

**By End of Week**:
1. Phase 1 endpoints complete and tested
2. Proposal submission UI functional
3. Identify any blockers

**By Week 2**:
1. All 16 endpoints implemented and tested
2. Integration testing with frontend
3. Bug fixes and optimization
4. Ready for staging environment

---

## 📌 KEY REMINDERS

- **Auto-Submit**: Don't forget the logic to auto-submit when all 9 attachments uploaded!
- **Multipart**: File uploads must use multipart/form-data, not JSON
- **OTP**: Make sure OTP is one-time use (invalidate after reset)
- **Status Flow**: Validate proposal status transitions on backend
- **Deadline**: Block proposals when submissions closed (set on backend, checked by frontend)
- **Protocol Numbers**: Format must be `PR{YEAR}/PROPOSAL/{ID}`

---

**This checklist ensures both teams are aligned and ready for successful integration.**

**Questions? Contact frontend team.**

---

**Document Version**: 1.0  
**Created**: May 25, 2026  
**Approval Status**: Pending backend review
