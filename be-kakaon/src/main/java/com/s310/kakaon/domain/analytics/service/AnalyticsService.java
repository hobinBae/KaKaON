package com.s310.kakaon.domain.analytics.service;

import com.s310.kakaon.domain.analytics.dto.*;

public interface AnalyticsService {

    SalesPeriodResponseDto getSalesByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period);

    SalesHourlyResponseDto getHourlyByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period);

    PaymentMethodRatioResponseDto getPaymentMethodRatioByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period);

    CancelRateResponseDto getCancelRateByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period);
}
