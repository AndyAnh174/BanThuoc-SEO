#!/usr/bin/env node

/**
 * Quick validation script for banthuoc-api MCP server
 * Run: node test.js  (after npm install && npm run build)
 */
import { endpoints as auth } from "./src/apis/auth.js";
import { endpoints as users } from "./src/apis/users.js";
import { endpoints as products } from "./src/apis/products.js";
import { endpoints as cart } from "./src/apis/cart.js";
import { endpoints as orders } from "./src/apis/orders.js";
import { endpoints as flashSale } from "./src/apis/flash-sale.js";
import { endpoints as vouchers } from "./src/apis/vouchers.js";
import { endpoints as reviews } from "./src/apis/reviews.js";
import { endpoints as blog } from "./src/apis/blog.js";
import { endpoints as shipping } from "./src/apis/shipping.js";
import { endpoints as banners } from "./src/apis/banners.js";
import { endpoints as admin } from "./src/apis/admin.js";
import { endpoints as search } from "./src/apis/search.js";
import { endpoints as files } from "./src/apis/files.js";

const all = [auth, users, products, cart, orders, flashSale, vouchers, reviews, blog, shipping, banners, admin, search, files];
const flat = all.flat();

console.log(`✅ ${all.length} domain files loaded`);
console.log(`✅ ${flat.length} total endpoints`);

// Validate structure
let errors = 0;
for (const ep of flat) {
  if (!ep.path) { console.error(`❌ Missing path`); errors++; }
  if (!ep.method) { console.error(`❌ Missing method for ${ep.path}`); errors++; }
  if (!ep.summary) { console.error(`❌ Missing summary for ${ep.method} ${ep.path}`); errors++; }
  if (!ep.tags?.length) { console.error(`❌ Missing tags for ${ep.method} ${ep.path}`); errors++; }
  if (!ep.params) { console.error(`❌ Missing params for ${ep.method} ${ep.path}`); errors++; }
}

// Group by tag
const tags = {};
for (const ep of flat) {
  for (const t of ep.tags) {
    tags[t] = (tags[t] || 0) + 1;
  }
}

console.log("\n📊 Endpoints by tag:");
for (const [tag, count] of Object.entries(tags).sort((a, b) => (b[1] as number) - (a[1] as number))) {
  console.log(`  ${tag.padEnd(20)} ${count}`);
}

if (errors === 0) {
  console.log("\n🎉 All endpoints valid!");
} else {
  console.log(`\n❌ ${errors} errors found`);
  process.exit(1);
}
