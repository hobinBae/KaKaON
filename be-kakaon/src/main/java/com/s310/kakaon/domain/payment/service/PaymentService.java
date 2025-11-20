package com.s310.kakaon.domain.payment.service;

import com.s310.kakaon.domain.payment.dto.CancelRateAnomalyDto;
import com.s310.kakaon.domain.payment.dto.PaymentCreateRequestDto;
import com.s310.kakaon.domain.payment.dto.PaymentResponseDto;
import com.s310.kakaon.domain.payment.dto.PaymentSearchRequestDto;
import com.s310.kakaon.global.dto.PageResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PaymentService {

    PaymentResponseDto registerPayment(Long memberId,Long storeId, Long orderId, PaymentCreateRequestDto request);

    void uploadPaymentsFromCsv(byte[] fileBytes, Long storeId, Long memberId);

    void uploadPaymentsFromCsvAsync(byte[] fileBytes, String fileName, Long storeId, Long memberId);

    PaymentResponseDto deletePayment(Long memberId, Long id);

    PageResponse<PaymentResponseDto> getPaymentsByStore(Long memberId, Long storeId, PaymentSearchRequestDto request, Pageable pageable);

    PaymentResponseDto getPaymentById(Long memberId, Long id);

    byte[] downloadPaymentsCsv(Long memberId, Long storeId, PaymentSearchRequestDto request);

    List<CancelRateAnomalyDto> findHourlyCancelRateAnomalies();

    List<CancelRateAnomalyDto> redisFindHourlyCancelRateAnomalies();

    PaymentResponseDto getPaymentByAuthorizationNo(Long memberId, String authorizationNo);

}
