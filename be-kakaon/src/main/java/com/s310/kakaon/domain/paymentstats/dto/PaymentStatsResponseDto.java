package com.s310.kakaon.domain.paymentstats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

public class PaymentStatsResponseDto {

    private Long storeId;
    private String statsDate;
    private Integer totalSales;
    private Integer totalCancelSales;

    private Integer cardSales;
    private Integer kakaoSales;
    private Integer cashSales;
    private Integer transferSales;
    private Integer deliverySales;

    private List<HourlyStats> hourlyStats;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HourlyStats {
        private int hour;
        private Integer hourlyTotalSales;
        private Integer hourlyPaymentCount;
        private Integer hourlyCancelCount;
        private Double hourlyCancelRate;
    }
}
