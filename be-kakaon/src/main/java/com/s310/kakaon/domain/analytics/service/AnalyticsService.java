package com.s310.kakaon.domain.analytics.service;

import com.s310.kakaon.domain.analytics.dto.SalesHourlyResponseDto;
import com.s310.kakaon.domain.analytics.dto.SalesPeriodRequestDto;
import com.s310.kakaon.domain.analytics.dto.SalesPeriodResponseDto;

public interface AnalyticsService {

    SalesPeriodResponseDto getSalesByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period);

    SalesHourlyResponseDto getHourlyByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period);

}
