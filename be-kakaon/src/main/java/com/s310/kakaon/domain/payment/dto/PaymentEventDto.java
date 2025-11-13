package com.s310.kakaon.domain.payment.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class PaymentEventDto implements Serializable {
    private String groupId;        // 같은 이상거래 케이스를 묶는 ID
    private Long paymentId;
    private Long storeId;
    private Long orderId;
    private String authorizationNo;  // 승인번호 (결제 식별자)
    private Integer amount;
    private String paymentMethod;     // CARD, KAKAOPAY, TRANSFER, CASH
    private String status;
    private LocalDateTime approvedAt;
    private LocalDateTime canceledAt;
    private Boolean isDelivery;
    private LocalDateTime createdDateTime;

    // 매장 위치 정보
    private BigDecimal storeLatitude;
    private BigDecimal storeLongitude;
    private String storeName;
}