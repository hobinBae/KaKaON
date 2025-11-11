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
  openTime?: string | null; // "HH:mm"
  closeTime?: string | null; // "HH:mm"
  closed: boolean;
}

export interface Store {
  storeId: number;
  name: string;
  // 목록 조회 시 필요한 최소 정보
  status: StoreStatus;
  unreadCount?: number; // 읽지 않은 알림 수
  // 대시보드용 요약 데이터
  totalSales?: number;
  cancelRate?: number;
  changeRate?: number;
}

// 가맹점 상세 정보 응답 타입
export interface StoreDetailResponse {
  storeId: number;
  ownerName: string;
  name: string;
  businessNumber: string;
  businessType: BusinessType;
  address: string;
  phone: string;
  status: StoreStatus;
  createdAt: string; // LocalDateTime은 string으로 받음
  businessHours: BusinessHour[];
  alertRecipientResponse: AlertRecipient[];
  // 요약 데이터 (상세 조회 시에도 필요할 수 있음)
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
  city: string;
  state?: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  businessHours: BusinessHour[];
}

export interface StoreUpdateRequest {
  name?: string;
  businessType?: BusinessType;
  phone?: string;
  businessHours?: BusinessHour[];
}

export interface OperationStatusUpdateRequest {
  status: StoreStatus;
}

export interface OperationStatusUpdateResponse {
  storeId: number;
  status: StoreStatus;
}

export interface AlertRecipient {
  id: number;
  name: string;
  position: string;
  email: string;
  active: boolean;
}

export interface AlertRecipientCreateRequest {
  name: string;
  position: string;
  email: string;
}

export interface AlertRecipientUpdateRequest {
  name?: string;
  position?: string;
  email?: string;
  active?: boolean;
}

// ================== Menu ==================
export interface Menu {
  id: number;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  description?: string;
}

// ================== Cart ==================
export type CartItem = Menu & { quantity: number };

// ================== Transaction ==================
export type Transaction = {
  id: number;
  items: { name: string; quantity: number; price: number }[];
  total: number;
  date: string;
  storeId: string;
  orderType: string;
  paymentMethod: string;
  status: 'completed' | 'cancelled';
};

// 다른 도메인(Order, Menu 등)의 타입도 여기에 추가할 수 있음
