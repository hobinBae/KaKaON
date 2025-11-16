package com.s310.kakaon.domain.paymentstats.service;

import com.s310.kakaon.domain.analytics.dto.SalesStatsResponseDto;
import com.s310.kakaon.domain.payment.dto.PaymentMethod;
import com.s310.kakaon.domain.payment.repository.PaymentRepository;
import com.s310.kakaon.domain.payment.service.SalesCacheService;
import com.s310.kakaon.domain.paymentstats.entity.PaymentStats;
import com.s310.kakaon.domain.paymentstats.entity.PaymentStatsHourly;
import com.s310.kakaon.domain.paymentstats.repository.PaymentStatsHourlyRepository;
import com.s310.kakaon.domain.paymentstats.repository.PaymentStatsRepository;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentStatsServiceImpl implements PaymentStatsService {

    private final StoreRepository storeRepository;
    private final PaymentStatsRepository statsRepository;
    private final PaymentStatsHourlyRepository statsHourlyRepository;
    private final SalesCacheService salesCacheService;

    private static final DateTimeFormatter REDIS_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public void saveDailyPaymentStats(Long storeId, LocalDate date) {

        // 기본 검증
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        String redisDate = date.format(REDIS_DATE_FORMAT);
        SalesStatsResponseDto redisStats = salesCacheService.getSalesStats(storeId, redisDate);

        // 시간대별 취소율 합계 계산
        Integer totalCancelSales = 0;
        for (int hour = 0; hour < 24; hour++) {
            String hourlyKey = String.format("sales:hourly:%d:%s:%02d", storeId, redisDate, hour);
            Integer hourlyCancelSales = salesCacheService.getIntValue(hourlyKey);
            totalCancelSales += hourlyCancelSales;
        }

        // 결제수단별 매출 합계 불러오기
        Map<PaymentMethod, Integer> paymentMethodSales =
                paymentRepository.getSalesSumByPamentMethod(store, date);

        Integer deliverySum = paymentRepository.getDeliverySales(store, date);

        // 기존 데이터 확인 (중복 방지)
        PaymentStats daily = statsRepository.findByStoreIdAndStatsDate(storeId, date)
                .orElse(null);

        if (daily != null) {
            // 기존 데이터 업데이트
            daily.updateFromRedis(
                    redisStats.getTotalSales(),
                    totalCancelSales,
                    redisStats.getPaymentCount() != null ? redisStats.getPaymentCount().longValue() : 0L,
                    redisStats.getCancelCount() != null ? redisStats.getCancelCount().longValue() : 0L,
                    paymentMethodSales.getOrDefault(PaymentMethod.CARD, 0),
                    paymentMethodSales.getOrDefault(PaymentMethod.KAKAOPAY, 0),
                    paymentMethodSales.getOrDefault(PaymentMethod.CASH, 0),
                    paymentMethodSales.getOrDefault(PaymentMethod.TRANSFER, 0),
                    deliverySum
            );
        } else {
            // 새로운 데이터 생성
            daily = PaymentStats.builder()
                    .store(store)
                    .statsDate(date)
                    .totalSales(redisStats.getTotalSales())
                    .totalCancelSales(totalCancelSales)
                    .salesCnt(redisStats.getPaymentCount() != null ? redisStats.getPaymentCount().longValue() : 0L)
                    .cancelCnt(redisStats.getCancelCount() != null ? redisStats.getCancelCount().longValue() : 0L)
                    .cardSales(paymentMethodSales.getOrDefault(PaymentMethod.CARD, 0))
                    .kakaoSales(paymentMethodSales.getOrDefault(PaymentMethod.KAKAOPAY, 0))
                    .cashSales(paymentMethodSales.getOrDefault(PaymentMethod.CASH, 0))
                    .transferSales(paymentMethodSales.getOrDefault(PaymentMethod.TRANSFER, 0))
                    .deliverySales(deliverySum)
                    .build();
            statsRepository.save(daily);
        }

        // 시간대별 통계 처리 (중복 방지)
        final PaymentStats finalDaily = daily;
        for (SalesStatsResponseDto.HourlySales hourlySale : redisStats.getHourlySales()) {
            PaymentStatsHourly hourlyStats = statsHourlyRepository
                    .findByPaymentStatsIdAndHour(finalDaily.getId(), hourlySale.getHour())
                    .orElse(null);

            if (hourlyStats != null) {
                // 기존 데이터 업데이트
                hourlyStats.updateFromRedis(
                        hourlySale.getSales(),
                        hourlySale.getPaymentCount(),
                        hourlySale.getCancelCount(),
                        hourlySale.getCancelRate()
                );
            } else {
                // 새로운 데이터 생성
                hourlyStats = PaymentStatsHourly.builder()
                        .paymentStats(finalDaily)
                        .hour(hourlySale.getHour())
                        .hourlyTotalSales(hourlySale.getSales())
                        .hourlyPaymentCount(hourlySale.getPaymentCount())
                        .hourlyCancelCount(hourlySale.getCancelCount())
                        .hourlyCancelRate(hourlySale.getCancelRate())
                        .build();
                statsHourlyRepository.save(hourlyStats);
            }
        }

    }
}
