package com.s310.kakaon.domain.payment.repository;

import com.querydsl.jpa.impl.JPAQueryFactory;
import com.s310.kakaon.domain.payment.dto.CancelRateAnomalyDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class PaymentCancelRepositoryImpl implements PaymentCancelRepositoryCustom {

    private final JPAQueryFactory query;

    @Override
    public List<CancelRateAnomalyDto> getWeeklyCancelStats() {
        return List.of();
    }
}
