package com.s310.kakaon.domain.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MonthlySalesDto {
    private int month;
    private Long totalSales;
}
