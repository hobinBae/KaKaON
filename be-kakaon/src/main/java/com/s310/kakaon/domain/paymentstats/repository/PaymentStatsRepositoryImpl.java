package com.s310.kakaon.domain.paymentstats.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.s310.kakaon.domain.analytics.dto.MonthlySalesDto;
import com.s310.kakaon.domain.paymentstats.entity.QPaymentStats;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class PaymentStatsRepositoryImpl implements PaymentStatsRepositoryCustom {

    private final JPAQueryFactory queryFactory;
    QPaymentStats paymentStats = QPaymentStats.paymentStats;

    @Override
    public List<MonthlySalesDto> findMonthlySalesByYear(Long storeId, int year) {
        return queryFactory
                .select(Projections.constructor(MonthlySalesDto.class,
                        paymentStats.statsDate.month().as("month"),
                        paymentStats.totalSales.sum().longValue().as("totalSales")
                        ))
                .from(paymentStats)
                .where(paymentStats.store.id.eq(storeId)
                        .and(paymentStats.statsDate.year().eq(year)))
                .groupBy(paymentStats.statsDate.month())
                .orderBy(paymentStats.statsDate.month().asc())
                .fetch();

    }
}
