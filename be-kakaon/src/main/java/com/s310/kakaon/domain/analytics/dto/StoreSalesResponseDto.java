package com.s310.kakaon.domain.analytics.dto;

import lombok.*;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreSalesResponseDto {
    private Long memberId;
    private String periodType;
    private String startDate;
    private String endDate;
    private List<StoreSalesDto> storeSalesList;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StoreSalesDto {
        private Long storeId;
        private String storeName;
        private Long totalSales;
    }
}
