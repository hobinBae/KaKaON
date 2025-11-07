package com.s310.kakaon.domain.payment.repository;

import com.s310.kakaon.domain.payment.dto.PaymentMethod;
import com.s310.kakaon.domain.payment.dto.PaymentSearchRequestDto;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.store.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

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
     * 결제수단 별 매출 합계 조회
     */
    Map<PaymentMethod, Integer> getSalesSumByPamentMethod(Store store, LocalDate date);

    /**
     * 배달 매출 합계 조회
     */
    Integer getDeliverySales(Store store, LocalDate date);

}
