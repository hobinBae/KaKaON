package com.s310.kakaon.domain.paymentstats.repository;

import com.s310.kakaon.domain.analytics.dto.HourlyAvgDto;

import java.time.LocalDate;
import java.util.List;

public interface PaymentStatsHourlyRepositoryCustom {

    List<HourlyAvgDto> findAvgHourlySalesByPeriod(Long storeId, String periodType, LocalDate startDate, LocalDate endDate);
}
