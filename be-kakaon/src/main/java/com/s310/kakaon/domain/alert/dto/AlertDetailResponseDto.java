package com.s310.kakaon.domain.alert.dto;

import com.s310.kakaon.domain.alert.entity.AlertType;
import com.s310.kakaon.domain.payment.dto.PaymentSimpleResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class AlertDetailResponseDto {

    private String alertUuid;
    private AlertType alertType;
    private LocalDateTime detectedAt;
    private String description;
    private Boolean checked;
    private Boolean emailSent;


    List<PaymentSimpleResponseDto> payments;




}
