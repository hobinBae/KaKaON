package com.s310.kakaon.domain.payment.repository;

import com.s310.kakaon.domain.payment.dto.CancelRateAnomalyDto;
import java.util.List;

public interface PaymentCancelRepositoryCustom {
    List<CancelRateAnomalyDto> getWeeklyCancelStats();
}
