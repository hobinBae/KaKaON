package com.s310.kakaon.domain.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class PaymentResponseDto {

    private Long paymentId;
    private Long storeId;
    private Long orderId;
    private String storeName;
    private PaymentStatus status;
    private Integer amount;
    private LocalDateTime approvedAt;
    private String authorizationCode;

}
