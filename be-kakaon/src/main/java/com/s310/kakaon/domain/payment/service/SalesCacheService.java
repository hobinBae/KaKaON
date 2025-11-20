package com.s310.kakaon.domain.payment.service;

import com.s310.kakaon.domain.analytics.dto.SalesStatsResponseDto;

import java.time.LocalDateTime;

public interface SalesCacheService {

    /**
     * 결제 발생 시 Redis 통계 계산
     * @param storeId 매장 ID
     * @param amount 결제 금액
     * @param now 결제 발생 시각
     */
    void updatePaymentStats(Long storeId, Integer amount, LocalDateTime now, Boolean isDelivery);


    /**
     * 결제 취소 시 Redis 통계 계산
     * @param storeId 매장 ID
     * @param amount 취소 금액
     * @param now 결제 취소 발생 시각
     */
    void updateCancelStats(Long storeId, Integer amount, LocalDateTime now, Boolean isDelivery);

    /**
     * 매출 통계 조회 (Redis 기준)
     * @param storeId 매장 ID
     * @param date yyyyMMdd 형식의 조회 날짜
     * @return 해당 날짜의 매출 통계 (시간대별 포함)
     */
    SalesStatsResponseDto getSalesStats(Long storeId, String date);

    int getIntValue(String key);
}
