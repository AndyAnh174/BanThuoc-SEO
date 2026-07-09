/**
 * File Upload API Endpoints
 *
 * Source: server/apps/users/views/file_upload.py, server/apps/files/views.py
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/files/upload/",
    method: "POST",
    summary: "Upload file to MinIO (S3-compatible). Returns presigned URL for access.",
    description:
      "General-purpose file upload. Files stored in MinIO bucket 'banthuoc-storage'. " +
      "Presigned URL is generated with the public endpoint (minio.banthuocsi.vn) for correct signing.",
    tags: ["Files"],
    auth: ["Bearer JWT"],
    params: [],
    requestBody: {
      file: "File",
      folder: "string (optional, e.g., 'licenses', 'products', 'avatars')",
    },
    response: {
      id: "uuid",
      file_url: "https://minio.banthuocsi.vn/banthuoc-storage/licenses/abc.pdf",
      file_name: "abc.pdf",
      file_size: 102400,
      content_type: "application/pdf",
    },
  },
  {
    path: "/api/files/upload/",
    method: "GET",
    summary: "List files uploaded by current user",
    tags: ["Files"],
    auth: ["Bearer JWT"],
    params: [],
    response: [
      { id: "uuid", file_url: "https://...", file_name: "license.pdf", file_size: 102400, created_at: "2026-07-01" },
    ],
  },
  {
    path: "/api/files/delete/",
    method: "POST",
    summary: "Delete an uploaded file from MinIO",
    tags: ["Files"],
    auth: ["Bearer JWT"],
    params: [],
    requestBody: { file_id: "uuid (required)" },
    response: { message: "File deleted successfully" },
  },
];
