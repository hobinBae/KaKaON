package com.s310.kakaon.domain.paymentstats.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.s310.kakaon.domain.analytics.dto.CancelRateResponseDto;
import com.s310.kakaon.domain.analytics.dto.MonthlySalesDto;
import com.s310.kakaon.domain.analytics.dto.PaymentMethodRatioResponseDto;
import com.s310.kakaon.domain.analytics.dto.StoreSalesResponseDto;
import com.s310.kakaon.domain.member.entity.QMember;
import com.s310.kakaon.domain.paymentstats.entity.QPaymentStats;
import com.s310.kakaon.domain.store.entity.QStore;
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
    QStore store = QStore.store;

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
                startDate = LocalDate.now().minusDays(7);
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

    @Override
    public List<CancelRateResponseDto.CancelRateDailyDto> findCancelRateByPeriod(Long storeId, String periodType, LocalDate startDate, LocalDate endDate) {

            if(!periodType.equalsIgnoreCase("YEAR")) {
                return queryFactory
                        .select(Projections.constructor(CancelRateResponseDto.CancelRateDailyDto.class,
                                paymentStats.statsDate.stringValue(),
                                paymentStats.cancelCnt.sum()
                                        .divide(paymentStats.salesCnt.sum().doubleValue()).multiply(100.0),
                                paymentStats.salesCnt.sum(),
                                paymentStats.cancelCnt.sum()))
                        .from(paymentStats)
                        .where(
                                paymentStats.store.id.eq(storeId)
                                                .and(paymentStats.statsDate.between(startDate, endDate)))
                        .groupBy(paymentStats.statsDate)
                        .orderBy(paymentStats.statsDate.asc())
                        .fetch();
            }

            return queryFactory
                    .select(Projections.constructor(CancelRateResponseDto.CancelRateDailyDto.class,
                            com.querydsl.core.types.dsl.Expressions.stringTemplate(
                                    "CONCAT({0}, '-', LPAD({1}, 2, '0'))",
                                            paymentStats.statsDate.year().min().stringValue(),
                                            paymentStats.statsDate.month().min().stringValue()),
                            paymentStats.cancelCnt.sum()
                                    .divide(paymentStats.salesCnt.sum().doubleValue()).multiply(100.0),
                            paymentStats.salesCnt.sum(),
                            paymentStats.cancelCnt.sum()))
                    .from(paymentStats)
                    .where(
                            paymentStats.store.id.eq(storeId)
                                    .and(paymentStats.statsDate.between(startDate, endDate)))
                    .groupBy(paymentStats.statsDate.month())
                    .orderBy(paymentStats.statsDate.month().asc())
                    .fetch();

    }

    @Override
    public List<StoreSalesResponseDto.StoreSalesDto> findStoreSalesByPeriod(Long memberId, String periodType, LocalDate startDate, LocalDate endDate) {

        return queryFactory
                .select(Projections.constructor(StoreSalesResponseDto.StoreSalesDto.class,
                        store.id, store.name, paymentStats.totalSales.sum().longValue()))
                .from(paymentStats)
                .join(paymentStats.store, store)
                .where(
                        store.member.id.eq(memberId)
                                .and(paymentStats.statsDate.between(startDate, endDate)))
                .groupBy(store.id)
                .orderBy(store.name.asc())
                .fetch();

    }



}
