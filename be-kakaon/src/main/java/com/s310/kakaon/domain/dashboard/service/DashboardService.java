package com.s310.kakaon.domain.dashboard.service;

import com.s310.kakaon.domain.dashboard.dto.SalesStatsResponseDto;

public interface DashboardService {

    SalesStatsResponseDto getTodaySalesStats(Long storeId, Long memberId);
}
