package com.s310.kakaon.domain.store.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class StoreResponseDto {
    private Long storeId;
    private String name;
    private OperationStatus status;
    private Long unreadCount;

    // 매출 정보
    private Integer todaySales;           // 오늘 매출
    private Double yesterdayGrowthRate;   // 전일 대비 증감률 (%)
    private Integer weeklySales;          // 이번 주 누적 매출
    private Integer monthlySales;         // 이번 달 누적 매출
    private Double todayCancelRate;       // 오늘 취소율 (%)
}
