package com.s310.kakaon.domain.payment.service;

import com.s310.kakaon.domain.dashboard.dto.SalesStatsResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesCacheService {

    private final StringRedisTemplate redisTemplate;

    private static final String SUM_KEY = "sales:sum:%d:%s";            // storeId, yyyyMMdd
    private static final String HOURLY_KEY = "sales:hourly:%d:%s:%02d"; // storeId, yyyyMMdd, HH
    private static final String COUNT_PAYMENT_KEY = "sales:count:payment:%d:%s";
    private static final String COUNT_CANCEL_KEY = "sales:count:cancel:%d:%s";

    public void updatePaymentStats(Long storeId, Integer amount, LocalDateTime now) {
        String date = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int hour = now.getHour();

        redisTemplate.opsForValue().increment(String.format(SUM_KEY, storeId, date), amount.doubleValue());
        redisTemplate.opsForValue().increment(String.format(HOURLY_KEY, storeId, date, hour), amount.doubleValue());
        redisTemplate.opsForValue().increment(String.format(COUNT_PAYMENT_KEY, storeId, date));
    }

    public void updateCancelStats(Long storeId, Integer amount, LocalDateTime now) {
        String date = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        redisTemplate.opsForValue().increment(String.format(COUNT_CANCEL_KEY, storeId, date));
        redisTemplate.opsForValue().increment(String.format(SUM_KEY, storeId, date), -amount.doubleValue());
    }

    public SalesStatsResponseDto getSalesStats(Long storeId, String date) {

        // Redis에서 기본 통계 조회
        String totalSales = redisTemplate.opsForValue().get(String.format(SUM_KEY, storeId, date));
        String paymentCount = redisTemplate.opsForValue().get(String.format(COUNT_PAYMENT_KEY, storeId, date));
        String cancelCount = redisTemplate.opsForValue().get(String.format(COUNT_CANCEL_KEY, storeId, date));

        // 시간대별 매출 조회
        List<SalesStatsResponseDto.HourlySales> hourlySales = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            String key = String.format(HOURLY_KEY, storeId, date, hour);
            String sales = redisTemplate.opsForValue().get(key);

            hourlySales.add(SalesStatsResponseDto.HourlySales.builder()
                    .hour(hour)
                    .sales(Integer.parseInt(sales))
                    .build()
            );
        }

        // DTO 생성
        return SalesStatsResponseDto.builder()
                .storeId(storeId)
                .date(date)
                .totalSales(totalSales != null ? Integer.parseInt(totalSales) : 0)
                .paymentCount(paymentCount != null ? Integer.parseInt(paymentCount) : 0)
                .cancelCount(cancelCount != null ? Integer.parseInt(cancelCount) : 0)
                .hourlySales(hourlySales)
                .build();

    }
}
