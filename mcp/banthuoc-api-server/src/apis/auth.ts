/**
 * Auth API Endpoints
 *
 * Login, register, token refresh, email verification, password reset.
 * Source: server/apps/users/views/auth.py, registration.py
 *         server/apps/users/serializers/registration.py
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/auth/token/",
    method: "POST",
    summary: "Login — obtain JWT access & refresh tokens",
    description:
      "Authenticate with username/email and password. Returns `access` token (1-day expiry) " +
      "and `refresh` token (7-day expiry). User must have `status=ACTIVE` and `is_verified=True`. " +
      "If status is PENDING/LOCKED/REJECTED, returns a descriptive error message.",
    tags: ["Auth"],
    auth: ["Public"],
    params: [],
    requestBody: {
      username: "string (email hoặc username)",
      password: "string",
    },
    response: {
      access: "eyJ... (JWT, 1 day expiry, includes claims: username, email, role)",
      refresh: "eyJ... (JWT, 7 day expiry)",
    },
  },
  {
    path: "/api/auth/token/refresh/",
    method: "POST",
    summary: "Refresh expired access token",
    tags: ["Auth"],
    auth: ["Public"],
    params: [],
    requestBody: { refresh: "string (refresh token từ login)" },
    response: { access: "eyJ... (new access token)" },
  },
  {
    path: "/api/auth/register",
    method: "POST",
    summary: "Register B2B pharmacy account",
    description:
      "Multi-part form. Creates User + BusinessProfile. Sends verification email. " +
      "Supports JSON, multipart/form-data, and FormParser. Max 5 license files, each max 10MB.",
    tags: ["Auth"],
    auth: ["Public"],
    params: [],
    requestBody: {
      full_name: "string (required, max 255)",
      phone: "string (required, max 20)",
      email: "string (optional, unique if provided)",
      password: "string (required)",
      confirm_password: "string (required, must match password)",
      business_name: "string (required, max 255)",
      license_number: "string (required, max 100)",
      license_files: "[File] (optional, max 5 files, max 10MB each)",
      address: "string (required)",
      tax_id: "string (required, max 50)",
    },
    response: {
      message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
      user_id: 1,
      email: "user@example.com",
      status: "PENDING",
    },
  },
  {
    path: "/api/auth/verify-email/{token}/",
    method: "GET",
    summary: "Verify email with token from registration email",
    tags: ["Auth"],
    auth: ["Public"],
    params: [
      { name: "token", in: "path", type: "string", required: true, description: "Verification token from email link" },
    ],
    response: { message: "Email verified successfully." },
  },
  {
    path: "/api/auth/forgot-password/",
    method: "POST",
    summary: "Request password reset email",
    tags: ["Auth"],
    auth: ["Public"],
    params: [],
    requestBody: { email: "string (registered email)" },
    response: { message: "If the email exists, a reset link has been sent." },
  },
  {
    path: "/api/auth/reset-password/",
    method: "POST",
    summary: "Confirm password reset with token",
    tags: ["Auth"],
    auth: ["Public"],
    params: [],
    requestBody: {
      token: "string (from reset email)",
      password: "string (new password)",
      confirmPassword: "string",
    },
    response: { message: "Password reset successfully." },
  },
];
