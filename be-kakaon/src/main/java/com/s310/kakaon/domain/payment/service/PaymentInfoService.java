package com.s310.kakaon.domain.payment.service;

import com.s310.kakaon.domain.payment.dto.PaymentInfoRequestDto;
import com.s310.kakaon.domain.payment.dto.PaymentInfoResponseDto;
import jakarta.validation.Valid;

public interface PaymentInfoService {
    PaymentInfoResponseDto registerPaymentInfo(Long memberId, @Valid PaymentInfoRequestDto request);
}
