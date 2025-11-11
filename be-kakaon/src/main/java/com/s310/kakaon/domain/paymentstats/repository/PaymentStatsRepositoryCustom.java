package com.s310.kakaon.domain.paymentstats.repository;

import com.s310.kakaon.domain.analytics.dto.MonthlySalesDto;

import java.util.List;

public interface PaymentStatsRepositoryCustom {

    List<MonthlySalesDto> findMonthlySalesByYear(Long storeId, int year);
}
