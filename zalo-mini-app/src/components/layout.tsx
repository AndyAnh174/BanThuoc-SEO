import React, { useState, useEffect } from "react";
import { getSystemInfo } from "zmp-sdk";
import { AnimationRoutes, App, BottomNavigation, Icon, Route, SnackbarProvider, ZMPRouter, useNavigate, useLocation } from "zmp-ui";
import { AppProps } from "zmp-ui/app";
import { useAppStore } from "@/stores/app.store";

import HomePage from "@/pages/index";
import CategoryPage from "@/pages/categories";
import SearchPage from "@/pages/search";
import CartPage from "@/pages/cart";
import ProfilePage from "@/pages/profile";
import ProductDetailPage from "@/pages/product-detail";

export default function Layout() {
  const { isAuthenticated, login } = useAppStore();
  useEffect(() => { if (!isAuthenticated) login(); }, []);

  return (
    <App theme={getSystemInfo().zaloTheme as AppProps["theme"]}>
      <SnackbarProvider>
        <ZMPRouter>
          <AnimationRoutes>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<CategoryPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
          </AnimationRoutes>
          <BottomNav />
        </ZMPRouter>
      </SnackbarProvider>
    </App>
  );
}

function BottomNav() {
  const { cartCount } = useAppStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [tab, setTab] = useState("home");

  useEffect(() => {
    const p = loc.pathname;
    if (p.startsWith("/categories")) setTab("categories");
    else if (p.startsWith("/search")) setTab("search");
    else if (p.startsWith("/cart")) setTab("cart");
    else if (p.startsWith("/profile")) setTab("profile");
    else if (p === "/" || p === "") setTab("home");
  }, [loc]);

  return (
    <BottomNavigation fixed activeKey={tab} onChange={(key: string) => {
      setTab(key);
      nav("/" + (key === "home" ? "" : key));
    }}>
      <BottomNavigation.Item key="home" label="Trang chu" icon={<Icon icon="zi-home" />} />
      <BottomNavigation.Item key="categories" label="Danh muc" icon={<Icon icon="zi-list-1" />} />
      <BottomNavigation.Item key="search" label="Tim kiem" icon={<Icon icon="zi-search" />} />
      <BottomNavigation.Item key="cart" label="Gio hang" icon={<span style={{ fontSize: 20 }}>🛒</span>} badge={cartCount() > 0 ? String(cartCount()) : undefined} />
      <BottomNavigation.Item key="profile" label="Ca nhan" icon={<Icon icon="zi-user" />} />
    </BottomNavigation>
  );
}
