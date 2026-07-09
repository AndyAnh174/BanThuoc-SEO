#!/usr/bin/env node

/**
 * BanThuoc API MCP Server
 *
 * Exposes tools for AI agents to explore the BanThuoc API.
 * API spec compiled from Django source via vibe-hnindex code analysis.
 *
 * Tools:
 *   - list_endpoints  — Browse endpoints by tag/method
 *   - get_endpoint    — Full detail for one endpoint
 *   - search_api      — Keyword search across all endpoints
 *
 * Resource:
 *   - openapi://banthuoc/schema — Full OpenAPI 3.0 JSON
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import type { ApiEndpoint } from "./openapi.js";
import { BASE_URL, API_PREFIX } from "./openapi.js";

// ── Import all API domain files ───────────────────────────────────
import { endpoints as authEndpoints } from "./apis/auth.js";
import { endpoints as userEndpoints } from "./apis/users.js";
import { endpoints as productEndpoints } from "./apis/products.js";
import { endpoints as cartEndpoints } from "./apis/cart.js";
import { endpoints as orderEndpoints } from "./apis/orders.js";
import { endpoints as flashSaleEndpoints } from "./apis/flash-sale.js";
import { endpoints as voucherEndpoints } from "./apis/vouchers.js";
import { endpoints as reviewEndpoints } from "./apis/reviews.js";
import { endpoints as blogEndpoints } from "./apis/blog.js";
import { endpoints as shippingEndpoints } from "./apis/shipping.js";
import { endpoints as bannerEndpoints } from "./apis/banners.js";
import { endpoints as adminEndpoints } from "./apis/admin.js";
import { endpoints as searchEndpoints } from "./apis/search.js";
import { endpoints as fileEndpoints } from "./apis/files.js";

const ALL_ENDPOINTS: ApiEndpoint[] = [
  ...authEndpoints,
  ...userEndpoints,
  ...productEndpoints,
  ...cartEndpoints,
  ...orderEndpoints,
  ...flashSaleEndpoints,
  ...voucherEndpoints,
  ...reviewEndpoints,
  ...blogEndpoints,
  ...shippingEndpoints,
  ...bannerEndpoints,
  ...adminEndpoints,
  ...searchEndpoints,
  ...fileEndpoints,
];

// ── Utility ────────────────────────────────────────────────────────
function fmtMethod(m: string): string {
  const icons: Record<string, string> = { GET: "🟢", POST: "🟠", PUT: "🔵", PATCH: "🟡", DELETE: "🔴" };
  return `${icons[m] ?? "⚪"} ${m.padEnd(7)}`;
}

function fmtAuth(auth: string[]): string {
  if (!auth.length) return "Public";
  return auth.join(", ");
}

function buildMd(ep: ApiEndpoint): string {
  const lines: string[] = [];
  lines.push(`## ${fmtMethod(ep.method)} \`${ep.path}\``);
  lines.push(`**Summary:** ${ep.summary}`);
  lines.push(`**Auth:** ${fmtAuth(ep.auth)}`);
  lines.push(`**Tags:** ${ep.tags.join(", ")}`);
  if (ep.description) lines.push(`\n### Description\n${ep.description}`);

  const pathParams = ep.params.filter((p) => p.in === "path");
  if (pathParams.length) {
    lines.push("\n### Path Parameters\n| Name | Type | Required | Description |\n|------|------|----------|-------------|");
    for (const p of pathParams) lines.push(`| \`${p.name}\` | ${p.type} | ${p.required ? "Yes" : "No"} | ${p.description} |`);
  }

  const queryParams = ep.params.filter((p) => p.in === "query");
  if (queryParams.length) {
    lines.push("\n### Query Parameters\n| Name | Type | Required | Description |\n|------|------|----------|-------------|");
    for (const p of queryParams) lines.push(`| \`${p.name}\` | ${p.type} | ${p.required ? "Yes" : "No"} | ${p.description} |`);
  }

  if (ep.requestBody) {
    lines.push("\n### Request Body\n```json\n" + JSON.stringify(ep.requestBody, null, 2) + "\n```");
  }
  if (ep.response) {
    lines.push("\n### Response\n```json\n" + JSON.stringify(ep.response, null, 2) + "\n```");
  }
  return lines.join("\n");
}

// ── Server ─────────────────────────────────────────────────────────
const server = new McpServer({ name: "banthuoc-api", version: "1.0.0" });

// ── Tool: list_endpoints ──────────────────────────────────────────
server.tool(
  "list_endpoints",
  "List all BanThuoc API endpoints grouped by tag. Filter by tag or HTTP method.",
  {
    tag: z.string().optional().describe("Filter by tag: Auth, Products, Orders, Cart, Users, Admin, Vouchers, Flash Sale, Reviews, Shipping, Blog, Banners, Search, Files"),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional().describe("Filter by HTTP method"),
  },
  async ({ tag, method }) => {
    let eps = ALL_ENDPOINTS;
    if (tag) {
      const t = tag.toLowerCase();
      eps = eps.filter((ep) => ep.tags.some((tg) => tg.toLowerCase().includes(t)));
    }
    if (method) eps = eps.filter((ep) => ep.method === method);

    if (!eps.length) return { content: [{ type: "text", text: "No endpoints match the filters." }] };

    const groups = new Map<string, ApiEndpoint[]>();
    for (const ep of eps) {
      const g = ep.tags[0] ?? "Other";
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g)!.push(ep);
    }

    let out = `# BanThuoc API — ${eps.length} endpoints\n`;
    out += `Base: \`${BASE_URL}\` | Prefix: \`${API_PREFIX}\`\n\n---\n`;
    for (const [group, items] of groups) {
      out += `\n## ${group}\n| Method | Path | Auth | Summary |\n|--------|------|------|--------|\n`;
      for (const ep of items) {
        out += `| ${ep.method} | \`${ep.path}\` | ${fmtAuth(ep.auth)} | ${ep.summary} |\n`;
      }
    }
    out += "\n---\nUse `get_endpoint` with a path to see full details (params, body, response).";
    return { content: [{ type: "text", text: out }] };
  }
);

// ── Tool: get_endpoint ─────────────────────────────────────────────
server.tool(
  "get_endpoint",
  "Get complete details for one API endpoint: path params, query params, request body, response schema.",
  {
    path: z.string().describe("Exact API path, e.g. '/api/products/', '/api/auth/token/'"),
    method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]).optional().describe("HTTP method (disambiguate same path)"),
  },
  async ({ path, method }) => {
    const normalized = path.startsWith(API_PREFIX) ? path : `${API_PREFIX}${path}`;
    let matches = ALL_ENDPOINTS.filter((ep) => ep.path === normalized);
    if (method) matches = matches.filter((ep) => ep.method === method);

    if (!matches.length) {
      // Fuzzy fallback
      const fuzzy = ALL_ENDPOINTS.filter(
        (ep) => ep.path.includes(path) || ep.summary.toLowerCase().includes(path.toLowerCase())
      ).slice(0, 10);
      if (fuzzy.length) {
        const sug = fuzzy.map((ep) => `- ${fmtMethod(ep.method)} \`${ep.path}\` — ${ep.summary}`).join("\n");
        return { content: [{ type: "text", text: `No exact match. Did you mean:\n${sug}` }] };
      }
      return { content: [{ type: "text", text: `No endpoint matching "${path}". Use list_endpoints to browse.` }] };
    }

    if (matches.length > 1) {
      const sug = matches.map((ep) => `- ${fmtMethod(ep.method)} \`${ep.path}\` — ${ep.summary}`).join("\n");
      return { content: [{ type: "text", text: `Multiple matches. Specify method:\n${sug}` }] };
    }

    return { content: [{ type: "text", text: buildMd(matches[0]) }] };
  }
);

// ── Tool: search_api ───────────────────────────────────────────────
server.tool(
  "search_api",
  "Search API endpoints by keyword. Searches paths, summaries, descriptions, param names, and tags.",
  {
    query: z.string().describe("Keyword, e.g. 'login', 'order', 'flash sale', 'admin user'"),
    limit: z.number().optional().default(10).describe("Max results (default 10, max 25)"),
  },
  async ({ query, limit }) => {
    const q = query.toLowerCase();
    const max = Math.min(limit ?? 10, 25);

    const scored = ALL_ENDPOINTS
      .map((ep) => {
        let s = 0;
        const text = [ep.path, ep.summary, ep.description ?? "", ...ep.tags, ...ep.params.map((p) => `${p.name} ${p.description}`)].join(" ").toLowerCase();
        if (text.includes(q)) s += 10;
        for (const w of q.split(/\s+/)) {
          if (text.includes(w)) s += 3;
          if (ep.path.includes(w)) s += 5;
          if (ep.tags.some((t) => t.toLowerCase().includes(w))) s += 4;
        }
        return { ep, s };
      })
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, max);

    if (!scored.length) return { content: [{ type: "text", text: `No results for "${query}". Try different keywords or use list_endpoints.` }] };

    let out = `# Search: "${query}" (${scored.length} results)\n\n| # | Method | Path | Auth | Summary |\n|---|--------|------|------|--------|\n`;
    scored.forEach(({ ep }, i) => {
      out += `| ${i + 1} | ${fmtMethod(ep.method)} | \`${ep.path}\` | ${fmtAuth(ep.auth)} | ${ep.summary} |\n`;
    });
    out += "\n---\nUse `get_endpoint` with the exact path for full details.";
    return { content: [{ type: "text", text: out }] };
  }
);

// ── Resource: openapi://banthuoc/schema ────────────────────────────
server.resource("openapi-schema", "openapi://banthuoc/schema", async () => ({
  contents: [{
    uri: "openapi://banthuoc/schema",
    mimeType: "application/json",
    text: JSON.stringify(buildOpenApiSpec(), null, 2),
  }],
}));

function buildOpenApiSpec(): Record<string, any> {
  const paths: Record<string, any> = {};
  for (const ep of ALL_ENDPOINTS) {
    const openApiPath = ep.path.replace(/<[^:]+:([^>]+)>/g, "{$1}");
    if (!paths[openApiPath]) paths[openApiPath] = {};
    const method = ep.method.toLowerCase();
    paths[openApiPath][method] = {
      summary: ep.summary,
      description: ep.description ?? "",
      tags: ep.tags,
      parameters: ep.params.map((p) => ({ name: p.name, in: p.in, required: p.required, schema: { type: p.type }, description: p.description })),
      responses: { "200": { description: "Success", content: ep.response ? { "application/json": { schema: { example: ep.response } } } : undefined } },
      ...(ep.requestBody ? { requestBody: { required: true, content: { "application/json": { schema: { example: ep.requestBody } } } } } : {}),
      ...(ep.auth.includes("Bearer") ? { security: [{ BearerAuth: [] }] } : {}),
    };
  }
  return {
    openapi: "3.0.3",
    info: { title: "BanThuoc API", version: "v1", description: "B2B Pharmaceutical E-Commerce — banthuocsi.vn" },
    servers: [{ url: BASE_URL }],
    paths,
  };
}

// ── Start ──────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`BanThuoc API MCP started — ${ALL_ENDPOINTS.length} endpoints loaded`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
