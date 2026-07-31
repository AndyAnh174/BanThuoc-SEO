/** Membership & Profile API */

import { api } from "./api";

export function getProfile() {
  return api.get<any>("/me/");
}

export function getTiers() {
  return api.get<any[]>("/membership/tiers/");
}

export function getMyMembership() {
  return api.get<any>("/membership/my/");
}

export function getPointHistory() {
  return api.get<any[]>("/me/points/");
}

export function getNotifications() {
  return api.get<any[]>("/me/notifications/");
}

export function getAddresses() {
  return api.get<any[]>("/me/addresses/");
}

export function addAddress(data: any) {
  return api.post("/me/addresses/", data);
}

export function getAvailableVouchers() {
  return api.get<any[]>("/vouchers/available/");
}

export function checkVoucher(code: string, orderTotal: number) {
  return api.post("/vouchers/check/", { code, order_total: orderTotal });
}

export function applyVoucher(code: string, orderTotal: number) {
  return api.post("/vouchers/apply/", { code, order_total: orderTotal });
}

