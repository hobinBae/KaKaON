package com.s310.kakaon.domain.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HourlyAvgDto {

    private int hour;
    private Double avgTotalSales;
}
