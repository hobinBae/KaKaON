package com.s310.kakaon.domain.store.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class StoreResponseDto {
    private Long storeId;
    private String ownerName;
    private BusinessType businessType;
    private String address;
    private String name;
    private String phone;
    private String businessNumber;
    private StoreStatus status;
    private LocalDateTime createdAt;
    private List<BusinessHourDto> businessHours;

    private List<AlertRecipientResponseDto> alertRecipientResponse;

    private Long totalSales;          // 오늘 매출
    private Double cancelRate;        // 취소율 (%)
    private Double changeRate;        // 전일 대비 매출 증감률 (%)
    private Integer alertCount;       // 이상거래 알림 수


}
