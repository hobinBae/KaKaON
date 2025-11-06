package com.s310.kakaon.domain.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class CancelRateAnomalyDto {
    private Long storeId;
    private String storeName;
    private Double lastWeekCancelRate;
    private Double thisWeekCancelRate;
    private Double increasePercent;

    public CancelRateAnomalyDto(Long storeId, String storeName, Double lastWeekCancelRate, Double thisWeekCancelRate){
        this(storeId, storeName, lastWeekCancelRate, thisWeekCancelRate, null);
    }
}
