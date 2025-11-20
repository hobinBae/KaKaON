package com.s310.kakaon.domain.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponseDto {

    private Long storeId;
    private String date;
    private Integer todaySales;                 // 오늘 매출
    private Integer yesterdaySales;             // 어제 매출
    private Double yesterdayGrowthRate;         // 오늘 vs 어제 증감률
    private Integer lastWeekSameDaySales;       // 전주 동요일 매출
    private Double lastWeekGrowthRate;          // 오늘 vs 전주 동요일 증감률
    private Integer monthlyTotalSales;          // 이번 달 누적 매출
    private Double monthlyGrowthRate;           // 이번달 vs 저번달 증감률
    private List<DailySalesDto> recent7Days;    // 최근 7일 매출
//    private Integer abnormalCount;            // 이상 거래 건수

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySalesDto {
        private String date;
        private Integer totalSales;
    }
}
