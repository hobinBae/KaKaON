package com.s310.kakaon.domain.analytics.service;

import com.s310.kakaon.domain.analytics.dto.*;

public interface AnalyticsService {

    MenuSummaryResponseDto getMenuSummaryByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period);

    SalesPeriodResponseDto getSalesByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period);

    SalesHourlyResponseDto getHourlyByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period);

    PaymentMethodRatioResponseDto getPaymentMethodRatioByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period);

    CancelRateResponseDto getCancelRateByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period);

    StoreSalesResponseDto getStoreSalesByPeriod(Long memberId, SalesPeriodRequestDto period);
}
