package com.s310.kakaon.domain.payment.service;

import com.s310.kakaon.domain.payment.dto.PaymentCreateRequestDto;
import com.s310.kakaon.domain.payment.dto.PaymentResponseDto;

import java.util.List;

public interface PaymentService {

    PaymentResponseDto registerPayment(Long memberId, Long storeId, Long orderId, PaymentCreateRequestDto request);

    List<PaymentResponseDto> getPaymentsByStore(Long memberId, Long storeId);

    PaymentResponseDto getPaymentById(Long memberId, Long storeId, Long id);




}
