import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { AlertType as ApiAlertType } from "@/types/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// AlertType을 한글로 변환하는 함수
export const getAlertTypeKorean = (type: ApiAlertType) => {
  switch (type) {
    case 'SAME_PAYMENT_METHOD':
      return '동일 결제수단 반복';
    case 'OUT_OF_BUSINESS_HOUR':
      return '영업시간 외 거래';
    case 'REPEATED_PAYMENT':
      return '단시간 반복 결제';
    case 'HIGH_AMOUNT_SPIKE':
      return '고액 결제 급증';
    case 'TRANSACTION_FREQUENCY_SPIKE':
      return '거래 빈도 급증';
    case 'CANCEL_RATE_SPIKE':
      return '취소율 급증';
    default:
      return type;
  }
};
