package com.s310.kakaon.domain.payment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class PaymentCreateRequestDto {

    private Integer amount;
    private PaymentMethod paymentMethod;
//    private PaymentStatus status; // 이건 좀 생각 좀
    private Boolean delivery;
    private String paymentUuid;
}
