package com.s310.kakaon.domain.alert.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class UnreadCountProjection {
    private Long storeId;
    private Long unreadCount;
}
