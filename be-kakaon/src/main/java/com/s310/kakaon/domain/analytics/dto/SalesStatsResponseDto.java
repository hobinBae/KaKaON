package com.s310.kakaon.domain.analytics.dto;

import lombok.*;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class SalesStatsResponseDto {

    private Long storeId;
    private String date;
    private Integer totalSales;
    private Integer paymentCount;
    private Integer cancelCount;
    private Double cancelRate;
    private List<HourlySales> hourlySales;

    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Getter
    public static class HourlySales {
        private Integer hour; // 0~23
        private Integer sales; // 해당 시간대 매출액
        private Integer paymentCount;
        private Integer cancelCount;
        private Double cancelRate;
    }
}
