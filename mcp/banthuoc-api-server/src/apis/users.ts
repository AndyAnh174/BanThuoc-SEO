/**
 * User Profile & Address API Endpoints
 *
 * Source: server/apps/users/views/profile.py, address.py, loyalty.py
 *         server/apps/users/serializers/admin.py
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  // ── Profile ───────────────────────────────────────────────
  {
    path: "/api/me/",
    method: "GET",
    summary: "Get current user profile with business info",
    tags: ["Users", "Profile"],
    auth: ["Bearer JWT"],
    params: [],
    response: {
      id: 1,
      full_name: "Nguyen Van A",
      email: "a@example.com",
      phone: "0901234567",
      role: "CUSTOMER",
      status: "ACTIVE",
      is_verified: true,
      avatar: "https://minio.banthuocsi.vn/banthuoc-storage/avatars/uuid.jpg",
      business_profile: {
        business_name: "Nha Thuoc A",
        license_number: "GP-001",
        tax_id: "123456789",
        address: "123 Nguyen Hue, Q1, HCMC",
        license_files: [{ id: "uuid", file_url: "https://..." }],
      },
      loyalty_points: 500,
    },
  },
  {
    path: "/api/me/update/",
    method: "PATCH",
    summary: "Update profile (full_name, phone)",
    tags: ["Users", "Profile"],
    auth: ["Bearer JWT"],
    params: [],
    requestBody: {
      full_name: "string (optional)",
      phone: "string (optional)",
    },
    response: { id: 1, full_name: "Updated Name", phone: "0911111111" },
  },
  {
    path: "/api/me/business-profile/",
    method: "PATCH",
    summary: "Update business profile (name, license, tax_id, address, license_files)",
    tags: ["Users", "Profile"],
    auth: ["Bearer JWT"],
    params: [],
    requestBody: {
      business_name: "string (optional)",
      license_number: "string (optional)",
      tax_id: "string (optional)",
      address: "string (optional)",
      license_files: "[File] (optional, max 5)",
    },
    response: { message: "Business profile updated." },
  },
  {
    path: "/api/me/avatar/",
    method: "POST",
    summary: "Upload avatar (max 5MB, images only: JPEG/PNG/WebP/GIF)",
    tags: ["Users", "Profile"],
    auth: ["Bearer JWT"],
    params: [],
    requestBody: { file: "File (image, max 5MB)" },
    response: { avatar_url: "https://minio.banthuocsi.vn/banthuoc-storage/avatars/abc.jpg" },
  },
  {
    path: "/api/me/change-password/",
    method: "POST",
    summary: "Change password (requires current password)",
    tags: ["Users", "Profile"],
    auth: ["Bearer JWT"],
    params: [],
    requestBody: {
      old_password: "string (current password)",
      new_password: "string",
      confirm_password: "string (must match new_password)",
    },
    response: { message: "Password changed successfully." },
  },
  {
    path: "/api/me/points/",
    method: "GET",
    summary: "Get loyalty points history (last 20 entries)",
    tags: ["Users", "Loyalty"],
    auth: ["Bearer JWT"],
    params: [],
    response: {
      total_points: 500,
      history: [
        { id: 1, points: 100, reason: "Purchase order #123", action: "EARN", created_at: "2026-07-01" },
      ],
    },
  },

  // ── Addresses ─────────────────────────────────────────────
  {
    path: "/api/me/addresses/",
    method: "GET",
    summary: "List saved addresses (full_name, phone, address, province, district, ward, is_default)",
    tags: ["Users", "Address"],
    auth: ["Bearer JWT"],
    params: [],
    response: [
      {
        id: 1,
        full_name: "Nguyen Van A",
        phone: "0901234567",
        address: "123 Nguyen Hue",
        province: "Hồ Chí Minh",
        district: "Quận 1",
        ward: "Phường Bến Nghé",
        is_default: true,
        created_at: "2026-07-01",
      },
    ],
  },
  {
    path: "/api/me/addresses/",
    method: "POST",
    summary: "Create address (first address auto-set as default)",
    tags: ["Users", "Address"],
    auth: ["Bearer JWT"],
    params: [],
    requestBody: {
      full_name: "string",
      phone: "string",
      address: "string",
      province: "string",
      district: "string",
      ward: "string",
      is_default: "boolean (optional)",
    },
    response: { id: 2, full_name: "...", address: "...", is_default: false },
  },
  {
    path: "/api/me/addresses/{id}/",
    method: "PATCH",
    summary: "Update address",
    tags: ["Users", "Address"],
    auth: ["Bearer JWT"],
    params: [{ name: "id", in: "path", type: "integer", required: true, description: "Address ID" }],
    requestBody: { full_name: "string", address: "string", is_default: "boolean" },
    response: { id: 1, message: "Updated" },
  },
  {
    path: "/api/me/addresses/{id}/",
    method: "DELETE",
    summary: "Delete address",
    tags: ["Users", "Address"],
    auth: ["Bearer JWT"],
    params: [{ name: "id", in: "path", type: "integer", required: true, description: "Address ID" }],
    response: { message: "Address deleted." },
  },
];
