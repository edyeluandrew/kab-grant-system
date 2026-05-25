# 🏗️ ARCHITECTURE & INTEGRATION GUIDE
## Frontend-Backend Integration Points & Data Flow

**Purpose**: Visual guide showing how frontend and backend systems integrate

---

## 📐 SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        USER BROWSER (React 19.2.6)                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    React Components (Protected)                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │ Applicant    │  │   Admin      │  │  Reviewer    │              │   │
│  │  │ Dashboard    │  │  Dashboard   │  │  Dashboard   │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │         │                 │                 │                       │   │
│  │         ├─────────────────┴─────────────────┤                       │   │
│  │         │                                   │                       │   │
│  │  ┌──────────────────────────┐  ┌───────────────────────┐           │   │
│  │  │ Proposal Submission Flow │  │ Review & Approval     │           │   │
│  │  │ - Create Proposal        │  │ Flow                  │           │   │
│  │  │ - Upload Attachments (9) │  │ - Assign Reviewers    │           │   │
│  │  │ - Add Team Members       │  │ - Set Deadlines       │           │   │
│  │  │ - Auto-Submit on Complete│  │ - Make Decisions      │           │   │
│  │  └──────────────────────────┘  └───────────────────────┘           │   │
│  │         │                                   │                       │   │
│  └─────────┼───────────────────────────────────┼───────────────────────┘   │
│            │                                   │                           │
│            └─────────┬───────────────────────┬─┘                           │
│                      │                       │                             │
│  ┌───────────────────┼───────────────────────┼──────────────────────────┐  │
│  │  Axios HTTP Client + Bearer Token Auth                              │  │
│  │  - Token Storage: localStorage['authToken']                         │  │
│  │  - Refresh Token: Auto-refresh on 401                               │  │
│  │  - Base URL: http://localhost:8000/api/v1 (dev)                    │  │
│  └───────────────────┼───────────────────────┼──────────────────────────┘  │
│                      │                       │                             │
└──────────────────────┼───────────────────────┼─────────────────────────────┘
                       │ HTTPS/HTTP            │
                       │                       │
┌──────────────────────┼───────────────────────┼─────────────────────────────┐
│                      │                       │                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    BACKEND API SERVER                               │  │
│  │  Base: https://kabfir-api.onrender.com/api/v1 (production)        │  │
│  │                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────┐   │  │
│  │  │ AUTH ENDPOINTS                                             │   │  │
│  │  │ POST /auth/register        → Create new user             │   │  │
│  │  │ POST /auth/login           → Get access + refresh tokens  │   │  │
│  │  │ GET /auth/me               → Current user info            │   │  │
│  │  │ POST /auth/refresh         → Refresh access token        │   │  │
│  │  │ POST /auth/change-password → Change password             │   │  │
│  │  │ POST /auth/forgot-password → Send OTP email              │   │  │
│  │  │ POST /auth/reset-password  → Verify OTP + reset          │   │  │
│  │  └────────────────────────────────────────────────────────────┘   │  │
│  │                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────┐   │  │
│  │  │ GENERAL ENDPOINTS (Reference Data)                         │   │  │
│  │  │ GET /general/faculties     → List of 5+ faculties         │   │  │
│  │  │ GET /general/departments   → Departments (filter by faculty) │  │  │
│  │  │ GET /general/settings      → System config + deadlines    │   │  │
│  │  │ POST /general/faculties    → Create faculty (admin)       │   │  │
│  │  │ PATCH /general/settings    → Update settings (admin)      │   │  │
│  │  └────────────────────────────────────────────────────────────┘   │  │
│  │                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────┐   │  │
│  │  │ PROPOSAL ENDPOINTS (Core Feature)                          │   │  │
│  │  │ POST /proposals               → Create (Draft)             │   │  │
│  │  │ GET /proposals/my             → List user's proposals      │   │  │
│  │  │ GET /proposals/{id}           → Get details               │   │  │
│  │  │ PATCH /proposals/{id}         → Update draft              │   │  │
│  │  │ DELETE /proposals/{id}        → Delete draft              │   │  │
│  │  │ POST /proposals/{id}/attachments → Upload (multipart!)    │   │  │
│  │  │ POST /proposals/{id}/team-members → Add co-inv            │   │  │
│  │  │ DELETE ...team-members/{memberId} → Remove co-inv         │   │  │
│  │  └────────────────────────────────────────────────────────────┘   │  │
│  │                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────┐   │  │
│  │  │ ADMIN ENDPOINTS (Management)                               │   │  │
│  │  │ GET /admin/dashboard         → Admin stats               │   │  │
│  │  │ GET /admin/users             → List all users            │   │  │
│  │  │ GET /admin/reviewers         → List reviewers            │   │  │
│  │  │ POST /admin/reviewers        → Add reviewer              │   │  │
│  │  │ GET /admin/proposals/{status}→ Get proposals by status   │   │  │
│  │  │ POST .../assign-reviewers    → Assign 1-3 reviewers     │   │  │
│  │  │ POST .../decision            → Approve/Reject/Award     │   │  │
│  │  └────────────────────────────────────────────────────────────┘   │  │
│  │                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────┐   │  │
│  │  │ REVIEWER ENDPOINTS                                         │   │  │
│  │  │ GET /reviewer/proposals      → Assigned proposals         │   │  │
│  │  │ GET /reviewer/proposals/{id} → Proposal details           │   │  │
│  │  │ POST .../review              → Submit review (1-10)       │   │  │
│  │  │ GET /reviewer/my-reviews     → User's submitted reviews   │   │  │
│  │  └────────────────────────────────────────────────────────────┘   │  │
│  │                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────┐   │  │
│  │  │ FILE STORAGE                                               │   │  │
│  │  │ Service: Cloudinary (or AWS S3)                           │   │  │
│  │  │ - Proposal documents stored here                          │   │  │
│  │  │ - Returns cloudinary_url for frontend download            │   │  │
│  │  └────────────────────────────────────────────────────────────┘   │  │
│  │                                                                      │  │
│  │  ┌────────────────────────────────────────────────────────────┐   │  │
│  │  │ DATABASE                                                   │   │  │
│  │  │ - Users (id, email, role, password_hash)                 │   │  │
│  │  │ - Proposals (id, title, status, pi_data, budget, etc.)   │   │  │
│  │  │ - Attachments (id, proposal_id, type, file_url)          │   │  │
│  │  │ - Team Members (id, proposal_id, name, email, etc.)      │   │  │
│  │  │ - Reviews (id, proposal_id, reviewer_id, score, etc.)    │   │  │
│  │  │ - Grant Calls (id, title, budget_limit, deadlines)       │   │  │
│  │  └────────────────────────────────────────────────────────────┘   │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 DATA FLOW: PROPOSAL SUBMISSION WORKFLOW

```
STEP 1: User Clicks "New Proposal"
┌──────────────────────────────┐
│ Frontend: Check if submissions │
│ are open using:               │
│ getSystemSettings()           │
└────────────┬───────────────────┘
             │
             ├─→ Backend: GET /general/settings
             │   Returns: is_accepting_applications, deadline, etc.
             │
             ├─→ Check: deadline passed?
             │   Check: is_accepting_applications = true?
             │
             └─→ IF blocked: Show error message
                IF open: Show form ✓

STEP 2: User Fills Proposal Form
┌──────────────────────────────┐
│ Fields:                       │
│ - Title, PI info, budget     │
│ - Problem statement, solution │
│ - Timeline, etc.              │
│                               │
│ Click: "Create & Continue"   │
└────────────┬───────────────────┘
             │
             ├─→ Frontend: Validate form
             │
             ├─→ Backend: POST /proposals
             │   Request: {grant_type, title, pi_*, total_budget, ...}
             │   Response: {id: 5, status: "Draft", attachments: []}
             │
             └─→ Frontend: Save proposalId, redirect to upload

STEP 3: User Uploads 9 Required Attachments
┌──────────────────────────────┐
│ Required Attachment Types:    │
│ 1. Full Proposal Document    │
│ 2. Gantt Chart               │
│ 3. Budget                    │
│ 4. National ID               │
│ 5. Confirmation Letter       │
│ 6. CVs                       │
│ 7. Consent Forms             │
│ 8. Research Instruments      │
│ 9. Faculty Support Evidence  │
│                               │
│ For each file:               │
│ Click: "Upload" → Select file │
└────────────┬───────────────────┘
             │
             ├─→ Frontend: Validate (size < 10MB, type = PDF/DOC)
             │
             ├─→ Backend: POST /proposals/{id}/attachments
             │   Format: multipart/form-data
             │   Fields: attachment_type, file
             │   Response: {id, cloudinary_url, ...}
             │
             ├─→ Frontend: Display "✓ Type uploaded"
             │
             ├─→ Check if all 9 uploaded? (Frontend sees attachments array)
             │
             └─→ WHEN ALL 9 UPLOADED:
                   Backend auto-updates status to "Submitted"

STEP 4: User Adds Team Members (Optional)
┌──────────────────────────────┐
│ Click: "Add Team Member"     │
│ Fill: Name, email, role      │
│ Click: "Save"                │
└────────────┬───────────────────┘
             │
             ├─→ Backend: POST /proposals/{id}/team-members
             │   Request: {first_name, last_name, email, ...}
             │   Response: {id, ...}
             │
             └─→ Frontend: Refresh team list

STEP 5: Proposal Submitted!
┌──────────────────────────────┐
│ Status Changes:              │
│ Draft → Submitted            │
│                               │
│ Notification: "Your proposal │
│ has been submitted for       │
│ review!"                     │
└────────────┬───────────────────┘
             │
             ├─→ Frontend: getMyProposals() refresh
             │
             └─→ Proposal appears in "Submitted Proposals" list
                 Admin can now assign reviewers
```

---

## 🔄 DATA FLOW: ADMIN REVIEW ASSIGNMENT

```
STEP 1: Admin Views Submitted Proposals
┌──────────────────────────────┐
│ Page: Admin → Proposals →    │
│ "Submitted"                  │
└────────────┬───────────────────┘
             │
             ├─→ Backend: GET /admin/proposals/submitted
             │   Returns: [{id, title, pi_name, budget, status: "Submitted"}]
             │
             └─→ Display list

STEP 2: Admin Selects Proposal & Assigns Reviewers
┌──────────────────────────────┐
│ Click: Proposal row           │
│ Modal opens: "Assign         │
│ Reviewers"                   │
│                               │
│ Frontend fetches:            │
│ getReviewers() →              │
│ GET /admin/reviewers         │
│ Returns: [{id, name, email}] │
└────────────┬───────────────────┘
             │
             ├─→ Show dropdown with available reviewers
             │
             ├─→ User selects 1-3 reviewers (checkboxes)
             │
             ├─→ Click: "Assign"
             │
             ├─→ Backend: POST /admin/proposals/{id}/assign-reviewers
             │   Request: {reviewer_ids: [1, 2, 3]}
             │
             ├─→ Response: Success
             │
             ├─→ Proposal status changes: Submitted → Scheduled for Review
             │
             └─→ Reviewers get notified (email trigger)

STEP 3: Set Review Deadline
┌──────────────────────────────┐
│ Same proposal detail page     │
│ For each assigned reviewer:  │
│ "Set Deadline" button        │
│ → Date picker → Select date  │
└────────────┬───────────────────┘
             │
             ├─→ Backend: POST /admin/proposals/{id}/set-deadline
             │   Request: {reviewer_id: 1, deadline: "2026-06-15"}
             │
             └─→ Reviewer sees deadline in their assigned proposals

STEP 4: Admin Monitors Review Progress
┌──────────────────────────────┐
│ Page: Admin → Proposals →    │
│ "Scheduled"                  │
│                               │
│ Shows:                       │
│ ✓ Reviewer 1: Submitted      │
│ ⏰ Reviewer 2: Pending       │
│ 🔴 Reviewer 3: 2 days late   │
└────────────┬───────────────────┘
             │
             ├─→ Backend query: GET /admin/proposals/scheduled
             │   Returns: proposals with reviewer_status array
             │
             └─→ Frontend shows status indicators
```

---

## 🔄 DATA FLOW: REVIEWER SUBMISSION

```
STEP 1: Reviewer Logs In & Views Dashboard
┌──────────────────────────────┐
│ Page: Reviewer Dashboard     │
│ Shows: Proposals assigned to │
│ current reviewer             │
└────────────┬───────────────────┘
             │
             ├─→ Backend: GET /reviewer/proposals
             │   Auth: Bearer {access_token}
             │   Returns: [{id, title, pi_name, deadline, status}]
             │
             └─→ Display list with deadline urgency

STEP 2: Reviewer Clicks Proposal to Review
┌──────────────────────────────┐
│ Detail page shows:           │
│ - Proposal info              │
│ - Attachments                │
│ - Team members               │
│ - Review form (1-10 score)   │
└────────────┬───────────────────┘
             │
             ├─→ Backend: GET /reviewer/proposals/{id}
             │   Returns: Full proposal + attachments
             │
             └─→ Reviewer can download & review files

STEP 3: Reviewer Submits Review
┌──────────────────────────────┐
│ Form fields:                 │
│ - Score: 1-10 buttons        │
│ - Recommendation: Radio      │
│   * Approve                  │
│   * Minor Revisions          │
│   * Major Revisions          │
│   * Reject                   │
│ - Comments: Textarea         │
│ - Report file: Upload (opt.) │
│                               │
│ Click: "Submit Review"       │
└────────────┬───────────────────┘
             │
             ├─→ Frontend: Validate form (score + recommendation required)
             │
             ├─→ Backend: POST /reviewer/proposals/{id}/review
             │   Request: {score: 8, recommendation: "Approve", comments: "..."}
             │
             ├─→ Response: {id, submitted_at, ...}
             │
             ├─→ Frontend: Show "✓ Review submitted"
             │
             ├─→ Proposal status: Scheduled → Reviewed (if all reviewers done)
             │
             └─→ Admin notified: "All reviews submitted for proposal X"

STEP 4: Reviewer Views Their Submitted Reviews
┌──────────────────────────────┐
│ Page: My Reviews             │
│ Shows: All reviews submitted │
│ by current reviewer          │
└────────────┬───────────────────┘
             │
             ├─→ Backend: GET /reviewer/my-reviews
             │   Returns: [{proposal_title, score, recommendation, submitted_at}]
             │
             └─→ Display (read-only after submission)
```

---

## 🔄 DATA FLOW: ADMIN DECISION MAKING

```
STEP 1: Admin Views Reviewed Proposals
┌──────────────────────────────┐
│ Page: Admin → Proposals →    │
│ "Reviewed"                   │
└────────────┬───────────────────┘
             │
             ├─→ Backend: GET /admin/proposals/reviewed
             │   Returns: proposals waiting for admin decision
             │
             └─→ Shows review scores & recommendations

STEP 2: Admin Reviews Comments & Makes Decision
┌──────────────────────────────┐
│ Click: Proposal row           │
│ Detail page shows:           │
│ - All reviewer feedback      │
│ - Scores (avg: 7.5/10)       │
│ - Recommendations count      │
│                               │
│ Admin chooses:               │
│ - Approve                    │
│ - Reject                     │
│ - Award (special)            │
│ Optional: Add note           │
└────────────┬───────────────────┘
             │
             ├─→ Backend: POST /admin/proposals/{id}/decision
             │   Request: {decision: "Approved", note: "..."}
             │
             ├─→ Response: Success
             │
             ├─→ Proposal moves to:
             │   - Approved list (decision = "Approved")
             │   - Rejected list (decision = "Rejected")
             │   - Awarded list (decision = "Awarded")
             │
             ├─→ PI notified: "Your proposal has been APPROVED/REJECTED"
             │
             └─→ Proposal no longer in "Reviewed" list
```

---

## 📡 AUTHENTICATION FLOW

```
STEP 1: User Logs In
┌──────────────────────────────┐
│ POST /auth/login             │
│ Request: {email, password}   │
│ Response: {                  │
│   access_token: "...",       │
│   refresh_token: "...",      │
│   user_id: 2,                │
│   role: "staff",             │
│   first_name: "Jane"         │
│ }                            │
│                               │
│ Frontend stores:             │
│ localStorage['authToken']    │
│ localStorage['kab_auth_user']│
└────────────┬───────────────────┘
             │
             └─→ All subsequent requests include:
                 Authorization: Bearer {access_token}

STEP 2: Access Token Expires (30 min)
┌──────────────────────────────┐
│ 401 Unauthorized error from  │
│ any API call                 │
└────────────┬───────────────────┘
             │
             ├─→ Frontend automatically calls:
             │   POST /auth/refresh
             │   With: {refresh_token}
             │
             ├─→ Backend returns new access_token
             │
             ├─→ Frontend retries original request with new token
             │
             └─→ User doesn't see interruption

STEP 3: Refresh Token Expires (7 days)
┌──────────────────────────────┐
│ Refresh fails (401)           │
│ Redirect to login             │
│ User must log in again        │
└────────────────────────────────┘
```

---

## 🔐 ROLE-BASED ACCESS CONTROL

```
User Roles: super_admin, sgo_admin, staff, applicant, reviewer

┌──────────────────────────────┬─────────────────────┐
│ Role                         │ Can Access          │
├──────────────────────────────┼─────────────────────┤
│ super_admin                  │ All admin features  │
│ sgo_admin                    │ Grant calls, users  │
│ staff / applicant            │ My proposals only   │
│ reviewer                     │ Assigned proposals  │
└──────────────────────────────┴─────────────────────┘

Frontend Protection:
- ProtectedRoute component checks allowedRoles
- Routes blocked at React level
- Still validates on backend with Bearer token

Backend Protection:
- Every endpoint validates role from JWT token
- Returns 403 Forbidden if unauthorized
- Never trust frontend role check alone!
```

---

## 🚨 ERROR HANDLING

```
All errors follow this pattern:

┌─────────────────────────────────────────┐
│ Response Status Codes:                   │
│                                          │
│ 200 OK - Success                        │
│ 201 Created - Resource created          │
│ 204 No Content - Deleted                │
│ 400 Bad Request - Validation failed     │
│ 401 Unauthorized - No valid token      │
│ 403 Forbidden - Permission denied      │
│ 404 Not Found - Resource not found     │
│ 422 Unprocessable - Field validation   │
│ 500 Server Error - Backend crash       │
└─────────────────────────────────────────┘

Error Response Format:

{
  "detail": "User-friendly error message"
}

Or for validation errors:

{
  "detail": {
    "email": ["Email already exists"],
    "password": ["Must be 8+ chars"]
  }
}

Frontend Handling:
1. Catch error response
2. Check status code
3. Display user-friendly message
4. Log to error tracking (production)
5. Optional: Retry with exponential backoff
```

---

## 🔄 CACHING STRATEGY

```
What to Cache Locally:

✅ System Settings (getSystemSettings)
   - Valid for: Full session
   - Refresh on: App start, admin updates

✅ Faculties (getFaculties)
   - Valid for: Full session
   - Refresh on: App start

✅ Departments (getDepartments)
   - Valid for: Full session
   - Refresh on: App start, faculty selected

✅ User Profile (getMe)
   - Valid for: 1 hour or until logout
   - Refresh on: App start, profile update

❌ DO NOT CACHE:

- Proposals (changes frequently)
- Reviews (user might submit anytime)
- Users list (admin might add/remove)
- Grant calls (frequently updated)

Invalidation Strategy:

1. Time-based: 1 hour cache max
2. Event-based: Refresh on create/update/delete
3. Logout: Clear all cache
4. Manual: Admin can force refresh
```

---

## 📊 PERFORMANCE TARGETS

```
Target Load Times:

Landing Page:        < 2 seconds
Login Page:          < 1 second
Admin Dashboard:     < 2 seconds
Proposal List:       < 1.5 seconds
Proposal Detail:     < 1 second (cached)
File Upload:         Instant start (show progress)

Network Optimization:

✓ Lazy load routes (admin/applicant/reviewer)
✓ Code split by feature
✓ Bundle size: ~60-70% reduction from 350KB → 100KB
✓ Tree-shake unused icons (Lucide)
✓ Minify + terser in production
✓ Compress large PDFs before upload
✓ Use Cloudinary image optimization

Monitoring:

- LogRocket for session replay
- Sentry for error tracking
- Analytics for user behavior
- Performance metrics in admin dashboard
```

---

## 🧪 TESTING CHECKLIST

Before going live:

**Unit Tests**:
- [ ] Each API function with mock data
- [ ] Form validation logic
- [ ] Permission checks (RBAC)
- [ ] File upload validators

**Integration Tests**:
- [ ] Full proposal submission flow
- [ ] Reviewer assignment & review
- [ ] Admin decision making
- [ ] Token refresh flow

**E2E Tests**:
- [ ] User registration → login → proposal submission
- [ ] Admin workflow (assign → review → decision)
- [ ] Reviewer workflow (receive → review → submit)
- [ ] Error scenarios (closed submissions, invalid file, etc.)

**Performance Tests**:
- [ ] Load times < targets
- [ ] Memory leaks on long sessions
- [ ] Bundle size check
- [ ] Database query optimization

**Security Tests**:
- [ ] RBAC enforcement (can't access other roles' data)
- [ ] Token expiration & refresh
- [ ] SQL injection (backend)
- [ ] XSS prevention (frontend)
- [ ] CSRF protection
```

---

**Document Version**: 1.0  
**Last Updated**: May 25, 2026  
**Status**: Reference guide for developers
