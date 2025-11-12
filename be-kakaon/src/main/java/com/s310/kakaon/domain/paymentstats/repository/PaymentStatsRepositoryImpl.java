package com.s310.kakaon.domain.paymentstats.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.s310.kakaon.domain.analytics.dto.MonthlySalesDto;
import com.s310.kakaon.domain.analytics.dto.PaymentMethodRatioResponseDto;
import com.s310.kakaon.domain.paymentstats.entity.QPaymentStats;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
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

    @Override
    public PaymentMethodRatioResponseDto findPaymentMethodStatsByPeriod(Long storeId, String periodType, LocalDate startDate, LocalDate endDate) {
        switch(periodType.toUpperCase()){
            case "YESTERDAY":
                startDate = LocalDate.now().minusDays(1);
                endDate = LocalDate.now().minusDays(1);
                break;
            case "WEEK":
                startDate = LocalDate.now().minusDays(6);
                endDate = LocalDate.now().minusDays(1);
                break;
            case "MONTH":
                startDate = LocalDate.now().withDayOfMonth(1);
                endDate = LocalDate.now();
                break;
            case "YEAR":
                startDate =LocalDate.of( LocalDate.now().getYear(), 1, 1);
                endDate = LocalDate.now();
                break;
            case "RANGE":
                if (startDate == null || endDate == null) {
                    throw new ApiException(ErrorCode.PERIOD_NOT_FOUND);
                }
                break;
            default:
                throw new ApiException(ErrorCode.INVALID_PERIOD);
        }

        return queryFactory
                .select(Projections.constructor(PaymentMethodRatioResponseDto.class,
                        paymentStats.store.id,
                        com.querydsl.core.types.dsl.Expressions.asString(periodType),
                        paymentStats.statsDate.min().stringValue(),
                        paymentStats.statsDate.max().stringValue(),
                        paymentStats.cardSales.sum().coalesce(0).longValue(),
                        paymentStats.cashSales.sum().coalesce(0).longValue(),
                        paymentStats.kakaoSales.sum().coalesce(0).longValue(),
                        paymentStats.transferSales.sum().coalesce(0).longValue(),
                        paymentStats.totalSales.sum().coalesce(0)
                                .subtract(paymentStats.deliverySales.sum().coalesce(0)).longValue(),
                        paymentStats.deliverySales.sum().coalesce(0).longValue(),
                        paymentStats.totalSales.sum().coalesce(0).longValue()))
                .from(paymentStats)
                .where(paymentStats.store.id.eq(storeId)
                        .and(paymentStats.statsDate.between(startDate, endDate)))
                .fetchOne();


    }


}
