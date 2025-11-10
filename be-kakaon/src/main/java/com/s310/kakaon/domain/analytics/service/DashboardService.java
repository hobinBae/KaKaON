package com.s310.kakaon.domain.analytics.service;

import com.s310.kakaon.domain.analytics.dto.DashboardSummaryResponseDto;

public interface DashboardService {

    DashboardSummaryResponseDto getDashboardSummary(Long storeId, Long memberId);
}
