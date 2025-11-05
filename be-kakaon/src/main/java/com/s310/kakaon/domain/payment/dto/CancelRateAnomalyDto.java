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
    private Double lastWeekRate;
    private Double thisWeekRate;
//    private Double increasePercent;
}
