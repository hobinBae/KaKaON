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
public class SalesPeriodResponseDto {

    private Long storeId;
    private String periodType;
    private String startDate;
    private String endDate;

    private Long totalSales;

    private List<SalesData> saleList;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesData {
        private String date;
        private Long sales;
    }
}
