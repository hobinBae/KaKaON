package com.s310.kakaon.domain.payment.repository;

import com.s310.kakaon.domain.payment.dto.PaymentSearchRequestDto;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.store.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PaymentRepositoryCustom {

    /**
     * 필터링 조건을 적용하여 결제 내역을 페이지네이션 조회
     */
    Page<Payment> searchPayments(Store store, PaymentSearchRequestDto searchDto, Pageable pageable);

    /**
     * 필터링 조건을 적용하여 결제 내역을 전체 조회 (CSV 다운로드용)
     */
    List<Payment> searchPaymentsForExport(Store store, PaymentSearchRequestDto searchDto);

    /**
     * 전월 단건 결제 평균 금액 조회
     */
    Double findAveragePaymentAmountLastMonth(Store store);


}
