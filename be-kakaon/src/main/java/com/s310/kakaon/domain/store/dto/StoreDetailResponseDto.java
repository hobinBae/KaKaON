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
public class StoreDetailResponseDto {
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

}
