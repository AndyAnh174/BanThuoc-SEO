#!/usr/bin/env node

/**
 * Quick validation script for banthuoc-api MCP server
 * Run: node test.js  (after npm install && npm run build)
 */
import { endpoints as auth } from "./dist/apis/auth.js";
import { endpoints as users } from "./dist/apis/users.js";
import { endpoints as products } from "./dist/apis/products.js";
import { endpoints as cart } from "./dist/apis/cart.js";
import { endpoints as orders } from "./dist/apis/orders.js";
import { endpoints as flashSale } from "./dist/apis/flash-sale.js";
import { endpoints as vouchers } from "./dist/apis/vouchers.js";
import { endpoints as reviews } from "./dist/apis/reviews.js";
import { endpoints as blog } from "./dist/apis/blog.js";
import { endpoints as shipping } from "./dist/apis/shipping.js";
import { endpoints as banners } from "./dist/apis/banners.js";
import { endpoints as admin } from "./dist/apis/admin.js";
import { endpoints as search } from "./dist/apis/search.js";
import { endpoints as files } from "./dist/apis/files.js";
import { endpoints as miniappAuth } from "./dist/apis/miniapp-auth.js";
import { endpoints as miniappProfile } from "./dist/apis/miniapp-profile.js";
import { endpoints as miniappProducts } from "./dist/apis/miniapp-products.js";
import { endpoints as miniappCart } from "./dist/apis/miniapp-cart.js";
import { endpoints as miniappOrders } from "./dist/apis/miniapp-orders.js";
import { endpoints as miniappMembership } from "./dist/apis/miniapp-membership.js";
import { endpoints as miniappVouchers } from "./dist/apis/miniapp-vouchers.js";
import { endpoints as miniappChat } from "./dist/apis/miniapp-chat.js";
import { endpoints as miniappBanners } from "./dist/apis/miniapp-banners.js";
import { endpoints as miniappFlashsale } from "./dist/apis/miniapp-flashsale.js";
import { endpoints as miniappSearch } from "./dist/apis/miniapp-search.js";
import { endpoints as miniappAdmin } from "./dist/apis/miniapp-admin.js";

const all = [auth, users, products, cart, orders, flashSale, vouchers, reviews, blog, shipping, banners, admin, search, files, miniappAuth, miniappProfile, miniappProducts, miniappCart, miniappOrders, miniappMembership, miniappVouchers, miniappChat, miniappBanners, miniappFlashsale, miniappSearch, miniappAdmin];
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
for (const [tag, count] of Object.entries(tags).sort((a, b) => Number(b[1]) - Number(a[1]))) {
  console.log(`  ${tag.padEnd(20)} ${count}`);
}

if (errors === 0) {
  console.log("\n🎉 All endpoints valid!");
} else {
  console.log(`\n❌ ${errors} errors found`);
  process.exit(1);
}
