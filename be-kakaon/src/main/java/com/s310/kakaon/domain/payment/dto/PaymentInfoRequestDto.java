package com.s310.kakaon.domain.payment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentInfoRequestDto {

    @NotBlank(message = "결제 수단 ID는 필수입니다.")
    private String paymentUuid;
}