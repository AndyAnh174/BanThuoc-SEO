/** Banners API — Mini App specific endpoints */

import { api } from "./api";

export interface BannerItem {
  id: string; title: string; subtitle?: string;
  image_url: string; link_url?: string;
  position: string; is_active: boolean;
  sort_order?: number;
  background_color?: string; text_color?: string;
}

export function getHeroBanners() {
  return api.get<BannerItem[]>("/banners/hero/");
}

export function getRowBanners() {
  return api.get<BannerItem[]>("/banners/row/");
}
