package com.s310.kakaon.domain.payment.mapper;

import com.s310.kakaon.domain.payment.dto.PaymentInfoRequestDto;
import com.s310.kakaon.domain.payment.dto.PaymentInfoResponseDto;
import com.s310.kakaon.domain.payment.entity.PaymentInfo;
import org.springframework.stereotype.Component;

@Component
public class PaymentInfoMapper {

    public PaymentInfo toEntity(PaymentInfoRequestDto request) {
        return PaymentInfo.builder()
                .paymentUuid(request.getPaymentUuid())
                .build();
    }

    public PaymentInfoResponseDto fromEntity(PaymentInfo paymentInfo) {
        return PaymentInfoResponseDto.builder()
                .paymentInfoId(paymentInfo.getPayment_info_id())
                .paymentUuid(paymentInfo.getPaymentUuid())
                .build();
    }
}