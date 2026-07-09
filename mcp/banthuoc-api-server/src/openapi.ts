/**
 * BanThuoc API MCP — Shared Types
 *
 * All API domain files export an `endpoints: ApiEndpoint[]` array.
 * openapi.ts aggregates them into one spec consumed by the MCP server.
 */

export interface ApiParam {
  name: string;
  in: "path" | "query" | "body";
  type: string;
  required: boolean;
  description: string;
}

export interface ApiEndpoint {
  path: string;           // Full path with /api prefix
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  summary: string;
  description?: string;
  tags: string[];
  auth: string[];
  params: ApiParam[];
  requestBody?: Record<string, any>;
  response?: Record<string, any>;
}

export interface ApiSpec {
  baseUrl: string;
  apiPrefix: string;
  version: string;
  endpoints: ApiEndpoint[];
}

export const BASE_URL = "https://banthuocsi.vn";
export const API_PREFIX = "/api";
