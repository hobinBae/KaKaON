package com.s310.kakaon.domain.store.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class OperationStatusUpdateResponseDto {
    private LocalDateTime updatedAt;
    private OperationStatus status;
}
