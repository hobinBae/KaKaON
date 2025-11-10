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

        // 일별 통계 엔티티 생성
        PaymentStats daily = PaymentStats.builder()
                .store(store)
                .statsDate(date)
                .totalSales(redisStats.getTotalSales())
                .totalCancelSales(totalCancelSales)
                .cardSales(paymentMethodSales.getOrDefault(PaymentMethod.CARD, 0))
                .kakaoSales(paymentMethodSales.getOrDefault(PaymentMethod.KAKAOPAY, 0))
                .cashSales(paymentMethodSales.getOrDefault(PaymentMethod.CASH, 0))
                .transferSales(paymentMethodSales.getOrDefault(PaymentMethod.TRANSFER, 0))
                .deliverySales(deliverySum)
                .build();

        statsRepository.save(daily);

        // 시간대별 통계 엔티티 리스트 생성
        List<PaymentStatsHourly> hourlyStats = redisStats.getHourlySales().stream()
                .map(h -> PaymentStatsHourly.builder()
                        .paymentStats(daily)
                        .hour(h.getHour())
                        .hourlyTotalSales(h.getSales())
                        .hourlyPaymentCount(h.getPaymentCount())
                        .hourlyCancelCount(h.getCancelCount())
                        .hourlyCancelRate(h.getCancelRate())
                        .build()
                )
                .collect(Collectors.toList());

        statsHourlyRepository.saveAll(hourlyStats);

    }
}
