/**
 * Mini App Chat API — pharmacist chat threads & messages
 * Source: server/apps/miniapp/views.py (ChatThreadListView, ChatMessageListView)
 */
import type { ApiEndpoint } from "../openapi.js";

export const endpoints: ApiEndpoint[] = [
  {
    path: "/api/miniapp/chat/threads/",
    method: "GET",
    summary: "Mini App — List user chat threads with pharmacist",
    tags: ["Mini App", "Chat"],
    auth: ["Bearer JWT (Mini App)"],
    params: [{ name: "status", in: "query", type: "string", required: false, description: "OPEN, CLOSED" }],
    response: [{ id: 1, category: "PRODUCT_ADVICE", subject: "Tư vấn thuốc ho", status: "OPEN", created_at: "..." }],
  },
  {
    path: "/api/miniapp/chat/threads/",
    method: "POST",
    summary: "Mini App — Create new chat thread",
    tags: ["Mini App", "Chat"],
    auth: ["Bearer JWT (Mini App)"],
    params: [],
    requestBody: {
      category: "PRODUCT_ADVICE | PRESCRIPTION_ADVICE | COMPLAINT | ORDER_SUPPORT",
      subject: "string", order_id: "integer (optional)",
    },
    response: { id: 1, category: "PRODUCT_ADVICE", subject: "...", status: "OPEN" },
  },
  {
    path: "/api/miniapp/chat/threads/{pk}/messages/",
    method: "GET",
    summary: "Mini App — Get messages in a thread",
    tags: ["Mini App", "Chat"],
    auth: ["Bearer JWT (Mini App)"],
    params: [{ name: "pk", in: "path", type: "integer", required: true, description: "Thread ID" }],
    response: [{ id: 1, sender_type: "USER", message: "...", is_read: true, created_at: "..." }],
  },
  {
    path: "/api/miniapp/chat/threads/{pk}/messages/",
    method: "POST",
    summary: "Mini App — Send message in thread",
    tags: ["Mini App", "Chat"],
    auth: ["Bearer JWT (Mini App)"],
    params: [{ name: "pk", in: "path", type: "integer", required: true, description: "Thread ID" }],
    requestBody: { message: "string", attachment_url: "string (optional)", attachment_type: "string (optional)" },
    response: { id: 2, sender_type: "USER", message: "...", is_read: false },
  },
];
