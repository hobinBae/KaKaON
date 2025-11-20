package com.s310.kakaon.domain.paymentstats.repository;

import com.s310.kakaon.domain.analytics.dto.CancelRateResponseDto;
import com.s310.kakaon.domain.analytics.dto.MonthlySalesDto;
import com.s310.kakaon.domain.analytics.dto.PaymentMethodRatioResponseDto;
import com.s310.kakaon.domain.analytics.dto.StoreSalesResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface PaymentStatsRepositoryCustom {

    List<MonthlySalesDto> findMonthlySalesByYear(Long storeId, int year);

    PaymentMethodRatioResponseDto findPaymentMethodStatsByPeriod(Long storeId, String periodType, LocalDate startDate, LocalDate endDate);

    List<CancelRateResponseDto.CancelRateDailyDto> findCancelRateByPeriod(Long storeId, String periodType, LocalDate startDate, LocalDate endDate);

    List<StoreSalesResponseDto.StoreSalesDto> findStoreSalesByPeriod(Long memberId, String periodType, LocalDate startDate, LocalDate endDate);
}
