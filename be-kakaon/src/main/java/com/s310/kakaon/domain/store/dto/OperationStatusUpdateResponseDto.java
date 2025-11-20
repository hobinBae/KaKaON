package com.s310.kakaon.domain.store.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class OperationStatusUpdateResponseDto {
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime updatedAt;
    private OperationStatus status;
}
