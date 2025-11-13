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
public class CancelRateResponseDto {

    private Long storeId;
    private String periodType;
    private String startDate;
    private String endDate;
    private List<CancelRateDailyDto> cancelRateList;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class  CancelRateDailyDto {
        private String date;
        private Double cancelRate;
        private Long totalSales; // YEAR용 (전체 판매건수)
        private Long cancelSales; // YEAR용 (취소건수)
    }
}
