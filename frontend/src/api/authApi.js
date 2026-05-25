import axiosClient from './axiosClient';

const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Mock Users DB (simulates backend) ───────────────────────────────────────
const mockUsersDB = [
  {
    id: 1,
    first_name: 'Admin',
    surname: 'DRP',
    other_name: '',
    gender: 'Male',
    phone: '+256700000001',
    email: 'admin@kab.ac.ug',
    password: 'admin1234',
    role: 'super_admin',
    faculty_id: 1,
    department_id: 101,
    is_active: true,
    must_change_password: false,
    access_token: 'mock_admin_token_abc123',
    refresh_token: 'mock_admin_refresh_abc123',
  },
  {
    id: 2,
    first_name: 'Jane',
    surname: 'Omondi',
    other_name: '',
    gender: 'Female',
    phone: '+256712345678',
    email: 'j.omondi@kab.ac.ug',
    password: 'staff1234',
    role: 'staff',
    faculty_id: 2,
    department_id: 201,
    is_active: true,
    must_change_password: false,
    access_token: 'mock_staff_token_xyz456',
    refresh_token: 'mock_staff_refresh_xyz456',
  },
  {
    id: 3,
    first_name: 'Prof. Samuel',
    surname: 'Wafula',
    other_name: '',
    gender: 'Male',
    phone: '+256756789012',
    email: 'swafula@external.org',
    password: 'reviewer1234',
    role: 'reviewer',
    faculty_id: null,
    department_id: null,
    is_active: true,
    must_change_password: false,
    access_token: 'mock_reviewer_token_rev789',
    refresh_token: 'mock_reviewer_refresh_rev789',
  },
  {
    id: 4,
    first_name: 'SGO',
    surname: 'Admin',
    other_name: '',
    gender: 'Male',
    phone: '+256700000004',
    email: 'sgo.admin@kab.ac.ug',
    password: 'sgo1234',
    role: 'sgo_admin',
    faculty_id: null,
    department_id: null,
    is_active: true,
    must_change_password: false,
    access_token: 'mock_sgo_token_sgo999',
    refresh_token: 'mock_sgo_refresh_sgo999',
  },
];

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerUser = async (payload) => {
  try {
    const response = await axiosClient.post('/auth/register', payload);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock register (API unavailable)', apiError.message);
    await delay();

    if (!payload.email.endsWith('@kab.ac.ug')) {
      throw new Error('Email must end with @kab.ac.ug');
    }

    const existing = mockUsersDB.find((u) => u.email === payload.email);
    if (existing) {
      throw new Error('This email is already registered');
    }

    if (payload.password !== payload.confirm_password) {
      throw new Error('Passwords do not match');
    }

    if (payload.password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const newUser = {
      id: mockUsersDB.length + 1,
      first_name: payload.first_name,
      surname: payload.surname,
      email: payload.email,
      role: 'staff',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    return newUser;
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginUser = async (payload) => {
  try {
    const response = await axiosClient.post('/auth/login', payload);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock login (API unavailable)', apiError.message);
    await delay();

    const user = mockUsersDB.find((u) => u.email === payload.email);

    if (!user || user.password !== payload.password) {
      throw new Error('Invalid email or password');
    }

    if (!user.is_active) {
      throw new Error('Your account has been deactivated. Contact the administrator.');
    }

    return {
      access_token: user.access_token,
      refresh_token: user.refresh_token,
      token_type: 'bearer',
      user_id: user.id,
      first_name: user.first_name,
      surname: user.surname,
      email: user.email,
      role: user.role,
      must_change_password: user.must_change_password || false,
    };
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────

export const getMe = async () => {
  try {
    const response = await axiosClient.get('/auth/me');
    return response.data;
  } catch (apiError) {
    console.warn('Using stored auth (API unavailable)', apiError.message);
    const stored = localStorage.getItem('kab_auth_user');
    if (!stored) throw new Error('Not authenticated');
    return JSON.parse(stored);
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────

export const refreshToken = async (refreshTokenValue) => {
  try {
    const response = await axiosClient.post('/auth/refresh', { refresh_token: refreshTokenValue });
    return response.data;
  } catch (apiError) {
    console.warn('Using mock refresh token (API unavailable)', apiError.message);
    await delay();
    const mockUser = mockUsersDB.find((u) => u.refresh_token === refreshTokenValue);
    if (!mockUser) throw new Error('Invalid refresh token');
    return {
      access_token: mockUser.access_token,
      refresh_token: mockUser.refresh_token,
      token_type: 'bearer',
      user_id: mockUser.id,
    };
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────

export const changePassword = async (payload) => {
  try {
    const response = await axiosClient.post('/auth/change-password', payload);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock change password (API unavailable)', apiError.message);
    await delay();

    if (!payload.current_password || !payload.new_password || !payload.confirm_password) {
      throw new Error('All fields are required.');
    }
    if (payload.new_password !== payload.confirm_password) {
      throw new Error('New passwords do not match.');
    }
    if (payload.new_password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }

    return { success: true };
  }
};

// ─── Grant Calls (public + admin) ─────────────────────────────────────────────

const GRANT_CALLS_KEY = 'kab_grant_calls';

const initialGrantCalls = [
  {
    id: 1,
    title: 'Innovation Grant 2026',
    description: 'Open call for innovation-based proposals addressing local community challenges.',
    deadline: '2026-12-31',
    academic_year: 2026,
    is_active: true,
    application_window_open: '2026-01-01',
    application_window_close: '2026-12-31',
    eligibility_requirements: [
      'Staff of Kabale University',
      'Minimum 3 years teaching/research experience',
      'Affiliated with recognized department',
      'No pending projects',
    ],
    guidelines_file: null,
    created_at: '2026-01-15',
  },
  {
    id: 2,
    title: 'Research Excellence 2026',
    description: 'Funding research projects aligned with National Development Plan IV priorities.',
    deadline: '2026-11-30',
    academic_year: 2026,
    is_active: true,
    application_window_open: '2026-02-01',
    application_window_close: '2026-11-30',
    eligibility_requirements: [
      'Registered doctoral student or postdoc',
      'Research aligned with NDP IV',
      'Institutional approval required',
    ],
    guidelines_file: null,
    created_at: '2026-02-01',
  },
];

const getStoredGrantCalls = () => {
  try {
    const stored = localStorage.getItem(GRANT_CALLS_KEY);
    if (stored) return JSON.parse(stored);
    localStorage.setItem(GRANT_CALLS_KEY, JSON.stringify(initialGrantCalls));
    return initialGrantCalls;
  } catch {
    return initialGrantCalls;
  }
};

const saveGrantCalls = (calls) => {
  localStorage.setItem(GRANT_CALLS_KEY, JSON.stringify(calls));
};

// ✅ FIXED: was '/general/settings' which returned wrong data
export const getGrantCalls = async () => {
  try {
    const response = await axiosClient.get('/admin/grant-calls');
    return response.data;
  } catch (apiError) {
    console.warn('Using mock grant calls (API unavailable)', apiError.message);
    await delay(300);
    return getStoredGrantCalls();
  }
};

export const createGrantCall = async (payload) => {
  try {
    const response = await axiosClient.post('/admin/grant-calls', payload);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock create grant call (API unavailable)', apiError.message);
    await delay();
    const calls = getStoredGrantCalls();
    const newCall = {
      id: Date.now(),
      title: payload.title,
      description: payload.description,
      deadline: payload.deadline,
      application_window_open: payload.application_window_open,
      application_window_close: payload.application_window_close,
      eligibility_requirements: payload.eligibility_requirements || [],
      guidelines_file: payload.guidelines_file || null,
      academic_year: payload.academic_year || new Date().getFullYear(),
      is_active: true,
      created_at: new Date().toISOString().split('T')[0],
    };
    calls.push(newCall);
    saveGrantCalls(calls);
    return newCall;
  }
};

export const updateGrantCall = async (callId, payload) => {
  try {
    const response = await axiosClient.put(`/admin/grant-calls/${callId}`, payload);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock update grant call (API unavailable)', apiError.message);
    await delay();
    const calls = getStoredGrantCalls();
    const updated = calls.map((c) =>
      c.id === callId
        ? {
            ...c,
            title: payload.title || c.title,
            description: payload.description || c.description,
            deadline: payload.deadline || c.deadline,
            application_window_open: payload.application_window_open || c.application_window_open,
            application_window_close: payload.application_window_close || c.application_window_close,
            eligibility_requirements: payload.eligibility_requirements || c.eligibility_requirements,
            guidelines_file: payload.guidelines_file !== undefined ? payload.guidelines_file : c.guidelines_file,
            academic_year: payload.academic_year || c.academic_year,
          }
        : c
    );
    saveGrantCalls(updated);
    return updated.find((c) => c.id === callId);
  }
};

export const openApplicationWindow = async (callId) => {
  try {
    const response = await axiosClient.post(`/admin/grant-calls/${callId}/open-window`);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock open window (API unavailable)', apiError.message);
    await delay();
    const calls = getStoredGrantCalls();
    const updated = calls.map((c) =>
      c.id === callId ? { ...c, application_window_open: new Date().toISOString().split('T')[0] } : c
    );
    saveGrantCalls(updated);
    return updated.find((c) => c.id === callId);
  }
};

export const closeApplicationWindow = async (callId) => {
  try {
    const response = await axiosClient.post(`/admin/grant-calls/${callId}/close-window`);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock close window (API unavailable)', apiError.message);
    await delay();
    const calls = getStoredGrantCalls();
    const updated = calls.map((c) =>
      c.id === callId ? { ...c, application_window_close: new Date().toISOString().split('T')[0] } : c
    );
    saveGrantCalls(updated);
    return updated.find((c) => c.id === callId);
  }
};

export const getApplicationWindowStatus = async (callId) => {
  await delay(200);
  const calls = getStoredGrantCalls();
  const call = calls.find((c) => c.id === callId);
  if (!call) throw new Error('Grant call not found');

  const now = new Date();
  const openDate = new Date(call.application_window_open);
  const closeDate = new Date(call.application_window_close);

  return {
    call_id: callId,
    is_open: now >= openDate && now <= closeDate,
    opens_at: call.application_window_open,
    closes_at: call.application_window_close,
    status: now < openDate ? 'pending' : now > closeDate ? 'closed' : 'open',
  };
};

export const toggleGrantCall = async (callId) => {
  await delay();
  const calls = getStoredGrantCalls();
  const updated = calls.map((c) =>
    c.id === callId ? { ...c, is_active: !c.is_active } : c
  );
  saveGrantCalls(updated);
  return { success: true };
};

export const deleteGrantCall = async (callId) => {
  await delay();
  const calls = getStoredGrantCalls().filter((c) => c.id !== callId);
  saveGrantCalls(calls);
  return { success: true };
};

// ─── Forgot Password ──────────────────────────────────────────────────────────

export const forgotPassword = async (payload) => {
  try {
    const response = await axiosClient.post('/auth/forgot-password', payload);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock forgot password (API unavailable)', apiError.message);
    await delay();

    const user = mockUsersDB.find((u) => u.email === payload.email);
    if (!user) {
      return { success: true, message: 'If email exists, OTP sent' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(`otp_${payload.email}`, otp);
    localStorage.setItem(`otp_expiry_${payload.email}`, Date.now() + 3600000);
    console.log(`Mock OTP for ${payload.email}: ${otp}`);

    return { success: true, message: 'OTP sent to your email' };
  }
};

// ─── Reset Password ──────────────────────────────────────────────────────────

export const resetPassword = async (payload) => {
  try {
    const response = await axiosClient.post('/auth/reset-password', payload);
    return response.data;
  } catch (apiError) {
    console.warn('Using mock reset password (API unavailable)', apiError.message);
    await delay();

    if (payload.new_password !== payload.confirm_password) {
      throw new Error('Passwords do not match');
    }
    if (payload.new_password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const storedOtp = localStorage.getItem(`otp_${payload.email}`);
    const otpExpiry = localStorage.getItem(`otp_expiry_${payload.email}`);

    if (!storedOtp || !otpExpiry) {
      throw new Error('OTP not found. Please request a new one.');
    }
    if (Date.now() > parseInt(otpExpiry)) {
      throw new Error('OTP has expired. Please request a new one.');
    }
    if (storedOtp !== payload.otp_code) {
      throw new Error('Invalid OTP. Please try again.');
    }

    localStorage.removeItem(`otp_${payload.email}`);
    localStorage.removeItem(`otp_expiry_${payload.email}`);

    return { success: true, message: 'Password reset successful' };
  }
};