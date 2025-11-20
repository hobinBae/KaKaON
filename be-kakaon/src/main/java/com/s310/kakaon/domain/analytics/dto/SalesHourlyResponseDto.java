package com.s310.kakaon.domain.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SalesHourlyResponseDto {
    private Long storeId;
    private String periodType;
    private String startDate;
    private String endDate;
    private List<HourlyData> hourlySales;

    @Getter
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class HourlyData {
        private int hour;
        private Double avgSales;
    }
}
