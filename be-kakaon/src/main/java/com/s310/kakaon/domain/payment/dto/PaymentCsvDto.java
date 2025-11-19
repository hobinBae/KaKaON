package com.s310.kakaon.domain.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentCsvDto {

    private String storeName;
    private String authorizationNo;
    private Integer amount;
    private String paymentMethod;
    private String status;
    private String deliveryType;
    private LocalDateTime approvedAt;
    private LocalDateTime canceledAt;
}
