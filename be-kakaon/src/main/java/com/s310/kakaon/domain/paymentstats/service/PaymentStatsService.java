package com.s310.kakaon.domain.paymentstats.service;

import java.time.LocalDate;

public interface PaymentStatsService {

    /**
     * Redis에 저장된 매출 통계를 하루 단위로 DB에 저장
     * @param storeId
     * @param date
     */
    void saveDailyPaymentStats(Long storeId, LocalDate date);
}
