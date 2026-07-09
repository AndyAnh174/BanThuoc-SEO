# BanThuoc API MCP Server

MCP (Model Context Protocol) server cho phép AI agents (Claude Code, Cursor, VS Code Copilot, Antigravity, Codex) khám phá & tra cứu API BanThuoc mà không cần đọc Swagger hay API docs.

## Cách hoạt động

```
Dev hỏi AI: "Làm sao tạo order?"
  → AI gọi MCP tool search_api(query="order")
    → MCP trả về danh sách endpoint liên quan
      → AI gọi get_endpoint(path="/api/orders/", method="POST")
        → MCP trả về params + body + response schema đầy đủ
          → AI trả lời chính xác cho dev
```

## Cấu trúc

```
mcp/banthuoc-api-server/
├── package.json          # Dependencies: @modelcontextprotocol/sdk, zod, typescript
├── tsconfig.json         # TypeScript config
├── README.md             # File này
├── test.js               # Quick validation script
├── dist/                 # Built output (sau khi build)
└── src/
    ├── index.ts          # MCP server entry point: 3 tools + 1 resource
    ├── openapi.ts        # Shared types (ApiEndpoint, ApiParam, ApiSpec)
    └── apis/             # 14 domain files, mỗi file là 1 nhóm API
        ├── auth.ts       # Login, register, token refresh, verify email, password reset
        ├── users.ts      # Profile (me/*), addresses, loyalty points
        ├── products.ts   # Products (list/detail/featured/sale/favorites), Categories (tree), Manufacturers
        ├── cart.ts       # Cart CRUD (get/add/update/clear)
        ├── orders.ts     # Orders (list/create/cancel/return/invoice), Dashboard stats
        ├── flash-sale.ts # Flash sale sessions, items, check
        ├── vouchers.ts   # Vouchers (available/check/apply/calculate/my/claim/detail)
        ├── reviews.ts    # Product reviews (public + admin moderate)
        ├── blog.ts       # Blog posts (public + admin CRUD), OG images
        ├── shipping.ts   # GHN + ViettelPost (provinces, districts, wards, fee, shipment)
        ├── banners.ts    # Banners (public visible + admin CRUD)
        ├── admin.ts      # Admin: Users, Products, Categories, Manufacturers, Vouchers, Flash Sales, Returns, Audit, Bug Reports, Product Types
        ├── search.ts     # Elasticsearch + DB search, autocomplete
        └── files.ts      # File upload/delete (MinIO)
```

## Cài đặt

```bash
cd mcp/banthuoc-api-server
npm install
npm run build
```

Verify:

```bash
node test.js
# ✅ 14 domain files loaded
# ✅ ~125 total endpoints
# 🎉 All endpoints valid!
```

## Tools

| Tool | Mô tả | Tham số |
|------|-------|---------|
| `list_endpoints` | Liệt kê tất cả API, filter theo `tag` hoặc `method` | `tag?`, `method?` |
| `get_endpoint` | Chi tiết 1 endpoint: path params, query params, request body, response schema | `path` (required), `method?` |
| `search_api` | Tìm API bằng keyword (path, summary, description, params, tags) | `query` (required), `limit?` |

## Resource

| URI | MIME | Mô tả |
|-----|------|-------|
| `openapi://banthuoc/schema` | `application/json` | OpenAPI 3.0 JSON đầy đủ (~125 endpoints) |

## Cấu hình cho từng AI tool

Tất cả đều là stdio transport — trỏ `command: node`, `args: path/to/dist/index.js`.

### Claude Code

File: `.claude/mcp.json` (project root)

```json
{
  "mcpServers": {
    "banthuoc-api": {
      "command": "node",
      "args": ["./mcp/banthuoc-api-server/dist/index.js"]
    }
  }
}
```

### Cursor

File: `.cursor/mcp.json` (project root)

```json
{
  "mcpServers": {
    "banthuoc-api": {
      "command": "node",
      "args": ["./mcp/banthuoc-api-server/dist/index.js"]
    }
  }
}
```

### Claude Desktop

File: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "banthuoc-api": {
      "command": "node",
      "args": ["D:\\Freelance\\BanThuoc-SEO\\mcp\\banthuoc-api-server\\dist\\index.js"]
    }
  }
}
```

> ⚠️ Claude Desktop cần path tuyệt đối với `\\` (Windows).

### VS Code Copilot / Antigravity / Codex

File: `.vscode/mcp.json` (project root)

```json
{
  "servers": {
    "banthuoc-api": {
      "type": "stdio",
      "command": "node",
      "args": ["./mcp/banthuoc-api-server/dist/index.js"]
    }
  }
}
```

## Ví dụ sử dụng

```
👤 "List all API endpoints related to orders"
🤖 list_endpoints(tag="Orders")
   → 9 endpoints: GET/POST /api/orders/, GET /api/orders/{id}/,
     POST cancel, POST return, GET invoice, GET returns/my,
     GET admin/dashboard/stats, GET admin/dashboard/revenue-chart

👤 "How do I create an order?"
🤖 get_endpoint(path="/api/orders/", method="POST")
   → Body: full_name, phone_number, email, address, province, district,
     ward, note, payment_method, items_input, voucher_code
   → Response: id, status, final_amount, items[]

👤 "Is there a flash sale API?"
🤖 search_api(query="flash sale")
   → 6 results: GET /api/flash-sale/, sessions, items, check,
     admin CRUD endpoints

👤 "Show me the voucher apply endpoint"
🤖 get_endpoint(path="/api/vouchers/apply/")
   → POST — Body: code, order_total, category_ids?, product_ids?,
     is_first_order?
   → Response: valid, discount_amount, final_total, voucher info
```

## Cập nhật khi backend thay đổi

1. Sửa file tương ứng trong `src/apis/<domain>.ts`
2. `npm run build`
3. Restart AI tool để load MCP lại

## API Spec Source

Toàn bộ endpoint được compile từ Django source code qua vibe-hnindex:
- URL configs: `server/apps/*/urls.py`
- Views + serializers: `server/apps/*/views/*.py`, `server/apps/*/serializers/*.py`

Để regenerate: dùng vibe-hnindex search lại codebase `banthuoc-server`.
