package com.s310.kakaon.domain.analytics.service;

import com.s310.kakaon.domain.analytics.dto.DashboardSummaryResponseDto;
import com.s310.kakaon.domain.analytics.dto.MonthlySalesResponseDto;

import java.time.LocalDate;

public interface DashboardService {

    DashboardSummaryResponseDto getDashboardSummary(Long storeId, Long memberId);

    MonthlySalesResponseDto getMonthlySales(Long storeId, Long memberId, LocalDate date);
}
