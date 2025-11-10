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
}
