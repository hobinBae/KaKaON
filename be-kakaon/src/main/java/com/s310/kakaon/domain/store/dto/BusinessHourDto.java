package com.s310.kakaon.domain.store.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.DayOfWeek;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessHourDto {
    private DayOfWeek dayOfWeek;
    private String openTime;
    private String closeTime;
    private boolean closed;
}
