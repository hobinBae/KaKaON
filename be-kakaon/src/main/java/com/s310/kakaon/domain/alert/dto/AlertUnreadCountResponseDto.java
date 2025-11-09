package com.s310.kakaon.domain.alert.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertUnreadCountResponseDto {
    private long unreadCount;
}
