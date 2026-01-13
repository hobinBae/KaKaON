package com.s310.kakaon.domain.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import org.springframework.format.annotation.DateTimeFormat;

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
    @DateTimeFormat(pattern = "yyyy.M.d HH:mm")
    private String deliveryType;
    private LocalDateTime approvedAt;
    private LocalDateTime canceledAt;
}
