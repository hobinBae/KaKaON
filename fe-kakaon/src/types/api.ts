// src/types/api.ts

// ================== Auth ==================
export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ================== Member ==================
export interface Member {
  id: number;
  email: string;
  name: string;
  phone?: string;
  provider: 'KAKAO' | 'GOOGLE';
  role: 'USER' | 'ADMIN';
  receiveEmail: boolean;
  adminPin: string;
}

export interface MemberUpdateRequest {
  name?: string;
  phone?: string;
  receiveEmail?: boolean;
  adminPin?: string;
}

// ================== Store ==================
export type BusinessType = 'RESTAURANT' | 'CAFE' | 'ETC';
export type StoreStatus = 'OPEN' | 'CLOSED';

export interface BusinessHour {
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  openTime: string; // "HH:mm"
  closeTime: string; // "HH:mm"
}

export interface Store {
  storeId: number;
  ownerName: string;
  name: string;
  businessNumber: string;
  businessType: BusinessType;
  address: string;
  phone: string;
  status: StoreStatus;
  businessHours: BusinessHour[];
  // 대시보드용 요약 데이터
  totalSales?: number;
  cancelRate?: number;
  changeRate?: number;
  alertCount?: number;
}

export interface StoreCreateRequest {
  name: string;
  businessNumber: string;
  businessType: BusinessType;
  address: string;
  phone: string;
  businessHours: BusinessHour[];
}

// 다른 도메인(Order, Menu 등)의 타입도 여기에 추가할 수 있음
