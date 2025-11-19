package com.s310.kakaon.domain.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MenuSummaryDto {
    private String menuName;    // 메뉴 이름
    private Long totalQuantity; // 총 판매량
    private Long totalSales;    // 총 매출액
}
