package com.s310.kakaon.domain.order.entity;

public enum OrderStatus {
    CREATED,   // 주문 생성됨
    PAID,      // 결제 완료
    CANCELED;  // 환불 완료
}
