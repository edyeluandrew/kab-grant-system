import axiosClient from './axiosClient';

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Register a new staff user.
 * POST /api/v1/auth/register
 * Body: { first_name, surname, other_name, gender, phone, email, password, confirm_password, faculty_id, department_id }
 */
export const registerUser = async (payload) => {
  if (!payload.faculty_id || !payload.department_id) {
    throw new Error('Faculty and department are required.');
  }
  const response = await axiosClient.post('/auth/register', {
    first_name: payload.first_name,
    surname: payload.surname,
    other_name: payload.other_name || '',
    gender: payload.gender,
    phone: payload.phone,
    email: payload.email,
    password: payload.password,
    confirm_password: payload.confirm_password,
    faculty_id: Number(payload.faculty_id),
    department_id: Number(payload.department_id),
  });
  return response.data;
};

/**
 * Login for all user types.
 * POST /api/v1/auth/login
 * Body: { email, password }
 * Returns: { access_token, refresh_token, token_type, user_id, role, must_change_password }
 */
export const loginUser = async (payload) => {
  const response = await axiosClient.post('/auth/login', {
    email: payload.email,
    password: payload.password,
  });
  return response.data;
};

/**
 * Get current authenticated user profile.
 * GET /api/v1/auth/me
 * Returns: { id, first_name, surname, other_name, gender, phone, email, role, faculty_id, department_id, is_active, created_at }
 */
export const getMe = async () => {
  const response = await axiosClient.get('/auth/me');
  return response.data;
};

/**
 * Refresh access token.
 * POST /api/v1/auth/refresh
 * Body: { refresh_token }
 * Returns: { access_token, refresh_token, token_type, user_id, role, must_change_password }
 */
export const refreshToken = async (refreshTokenValue) => {
  const response = await axiosClient.post('/auth/refresh', {
    refresh_token: refreshTokenValue,
  });
  return response.data;
};

/**
 * Change password for logged-in user.
 * POST /api/v1/auth/change-password
 * Body: { current_password, new_password, confirm_password }
 * Returns: { message }
 */
export const changePassword = async (payload) => {
  const response = await axiosClient.post('/auth/change-password', {
    current_password: payload.current_password,
    new_password: payload.new_password,
    confirm_password: payload.confirm_password,
  });
  return response.data;
};

/**
 * Request a password reset OTP.
 * POST /api/v1/auth/forgot-password
 * Body: { email }
 * Returns: { message }
 */
export const forgotPassword = async (payload) => {
  const response = await axiosClient.post('/auth/forgot-password', {
    email: payload.email,
  });
  return response.data;
};

/**
 * Reset password using OTP code.
 * POST /api/v1/auth/reset-password
 * Body: { email, otp_code, new_password, confirm_password }
 * Returns: { message }
 */
export const resetPassword = async (payload) => {
  const response = await axiosClient.post('/auth/reset-password', {
    email: payload.email,
    otp_code: payload.otp_code,
    new_password: payload.new_password,
    confirm_password: payload.confirm_password,
  });
  return response.data;
};