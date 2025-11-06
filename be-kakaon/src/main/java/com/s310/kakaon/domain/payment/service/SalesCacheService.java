package com.s310.kakaon.domain.payment.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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

    public void updateCancelStats(Long paymentId, Integer amount, LocalDateTime now) {
        String date = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        redisTemplate.opsForValue().increment(String.format(COUNT_CANCEL_KEY, paymentId, date));
        redisTemplate.opsForValue().increment(String.format(SUM_KEY, paymentId, date), -amount.doubleValue());
    }
}
