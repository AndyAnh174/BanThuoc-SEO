import React from "react";
import { getSystemInfo } from "zmp-sdk";
import { AnimationRoutes, App, Route, SnackbarProvider, ZMPRouter } from "zmp-ui";
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

  React.useEffect(() => {
    if (!isAuthenticated) login();
  }, []);

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
        </ZMPRouter>
      </SnackbarProvider>
    </App>
  );
}
