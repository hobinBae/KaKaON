package com.s310.kakaon.domain.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class PaymentSimpleResponseDto {
    private Long paymentId;
    private String authorizationNo;
    private Integer amount;
    private PaymentMethod paymentMethod;
}
