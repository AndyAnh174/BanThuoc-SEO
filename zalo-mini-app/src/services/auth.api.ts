/** Auth API */

import { api } from "./api";

export function login(zaloAccessToken: string, name: string, avatar: string) {
  return api.post<{ access: string; refresh: string; user: any; is_new_user: boolean }>("/auth/login/", {
    zalo_access_token: zaloAccessToken,
    name,
    avatar,
  });
}

export function refreshToken(refresh: string) {
  return api.post<{ access: string }>("/auth/refresh/", { refresh });
}
