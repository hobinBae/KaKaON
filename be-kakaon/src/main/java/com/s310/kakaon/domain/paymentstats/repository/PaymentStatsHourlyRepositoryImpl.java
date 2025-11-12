package com.s310.kakaon.domain.paymentstats.repository;

import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.s310.kakaon.domain.analytics.dto.HourlyAvgDto;
import com.s310.kakaon.domain.paymentstats.entity.QPaymentStats;
import com.s310.kakaon.domain.paymentstats.entity.QPaymentStatsHourly;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class PaymentStatsHourlyRepositoryImpl implements PaymentStatsHourlyRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    /**
     * SELECT
     *   ph.hour,
     *   AVG(ph.hourly_total_sales) AS avg_total_sales
     * FROM payment_stats_hourly ph
     * JOIN payment_stats ps ON ph.payment_stats_id = ps.payment_stats_id
     * WHERE ps.store_id = :storeId
     *   AND ps.stats_date BETWEEN :start AND :end
     * GROUP BY ph.hour
     * ORDER BY ph.hour ASC;
     */
    @Override
    public List<HourlyAvgDto> findAvgHourlySalesByPeriod(Long storeId, String periodType, LocalDate startDate, LocalDate endDate) {

        QPaymentStatsHourly hourly = QPaymentStatsHourly.paymentStatsHourly;
        QPaymentStats paymentStats = QPaymentStats.paymentStats;

        var query = queryFactory
                .select(
                        Projections.constructor(HourlyAvgDto.class,
                                hourly.hour,
                                hourly.hourlyTotalSales.avg()
                ))
                .from(hourly)
                .join(hourly.paymentStats, paymentStats)
                .where(paymentStats.store.id.eq(storeId));

        switch (periodType.toUpperCase()) {
            case "WEEK" ->
                query.where(paymentStats.statsDate.between(LocalDate.now().minusDays(6), LocalDate.now()));
            case "MONTH" ->
                query.where(paymentStats.statsDate.month().eq(LocalDate.now().getMonthValue()));
            case "YEAR" ->
                query.where(paymentStats.statsDate.year().eq(LocalDate.now().getYear()));
            case "RANGE" -> {
                if (startDate != null && endDate != null)
                    query.where(paymentStats.statsDate.between(startDate, endDate));
            }
        }

        return query
                .groupBy(hourly.hour)
                .orderBy(hourly.hour.asc())
                .fetch();
    }
}
