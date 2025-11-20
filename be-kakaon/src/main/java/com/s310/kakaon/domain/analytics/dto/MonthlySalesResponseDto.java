package com.s310.kakaon.domain.analytics.dto;

import lombok.*;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySalesResponseDto {

    private Long storeId;
    private String month;
    private List<DailySales> dailySales;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailySales {
        private String date;
        private Integer storeSales;
        private Integer deliverySales;
        private Integer totalSales;
    }
}
