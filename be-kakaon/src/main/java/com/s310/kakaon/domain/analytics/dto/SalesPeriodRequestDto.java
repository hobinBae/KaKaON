package com.s310.kakaon.domain.analytics.dto;

import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesPeriodRequestDto {

    private String periodType = "WEEK";

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;

    // Custom setters for validation
    public void setPeriodType(String periodType) {
        this.periodType = periodType;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public void setEndDate(LocalDate endDate) {
        // endDate가 현재 날짜보다 미래인 경우 현재 날짜로 조정
        LocalDate today = LocalDate.now();
        if (endDate != null && endDate.isAfter(today)) {
            this.endDate = today;
        } else {
            this.endDate = endDate;
        }
    }

}
