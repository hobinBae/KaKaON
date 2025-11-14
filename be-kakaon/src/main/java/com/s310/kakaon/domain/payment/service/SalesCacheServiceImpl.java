package com.s310.kakaon.domain.payment.service;

import com.s310.kakaon.domain.analytics.dto.SalesStatsResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesCacheServiceImpl implements SalesCacheService {

    private final StringRedisTemplate redisTemplate;
    private static final long SALES_TTL_HOURS = 48;

    // %d : storeId, $s : yyyyMMdd, %02d : HH
    private static final String SUM_GROSS_KEY = "sales:sum:gross:%d:%s";                                // 총 매출 (순 매출 + 취소 매출)
    private static final String SUM_KEY = "sales:sum:%d:%s";                                            // 순 매출
    private static final String SUM_CANCEL_KEY = "sales:sum:cancel:%d:%s";                              // 취소 매출

    private static final String SUM_DELIVERY_KEY = "sales:sum:delivery:%d:%s";                          // 오늘 총 배달 매출 금액

    private static final String COUNT_PAYMENT_KEY = "sales:count:payment:%d:%s";                        // 오늘 총 결제 건수
    private static final String COUNT_CANCEL_KEY = "sales:count:cancel:%d:%s";                          // 오늘 총 취소 건수

    private static final String HOURLY_KEY = "sales:hourly:%d:%s:%02d";                                 // 시간대별 매출
    private static final String COUNT_HOURLY_PAYMENT_KEY = "sales:hourly:count:payment:%d:%s:%02d";     // 시간대별 결제 건수
    private static final String COUNT_HOURLY_CANCEL_KEY = "sales:hourly:count:cancel:%d:%s:%02d";       // 시간대별 취소 건수
    private static final String RATE_CANCEL_KEY = "sales:hourly:rate:cancel:%d:%s:%02d";                // 시간대별 취소율

    @Override
    public void updatePaymentStats(Long storeId, Integer amount, LocalDateTime now, Boolean isDelivery) {
        String date = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int hour = now.getHour();

        redisTemplate.opsForValue().increment(String.format(SUM_GROSS_KEY, storeId, date), amount.doubleValue());
        redisTemplate.opsForValue().increment(String.format(SUM_KEY, storeId, date), amount.doubleValue());
        redisTemplate.opsForValue().increment(String.format(HOURLY_KEY, storeId, date, hour), amount.doubleValue());
        redisTemplate.opsForValue().increment(String.format(COUNT_PAYMENT_KEY, storeId, date));
        redisTemplate.opsForValue().increment(String.format(COUNT_HOURLY_PAYMENT_KEY, storeId, date, hour));

        if(Boolean.TRUE.equals(isDelivery)){
            redisTemplate.opsForValue().increment(String.format(SUM_DELIVERY_KEY, storeId, date), amount.doubleValue());
        }
        // TTL 설정
        setTtlForSalesKey(storeId, date);
    }

    @Override
    public void updateCancelStats(Long storeId, Integer amount, LocalDateTime now, Boolean isDelivery) {
        String date = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int hour = now.getHour();

        redisTemplate.opsForValue().increment(String.format(SUM_CANCEL_KEY, storeId, date), amount.doubleValue());
        redisTemplate.opsForValue().increment(String.format(COUNT_CANCEL_KEY, storeId, date));
        redisTemplate.opsForValue().increment(String.format(SUM_KEY, storeId, date), -amount.doubleValue());
        redisTemplate.opsForValue().increment(String.format(HOURLY_KEY, storeId, date, hour), -amount.doubleValue());
        redisTemplate.opsForValue().increment(String.format(COUNT_HOURLY_CANCEL_KEY, storeId, date, hour));

        if(Boolean.TRUE.equals(isDelivery)){
            redisTemplate.opsForValue().increment(String.format(SUM_DELIVERY_KEY, storeId, date), -amount.doubleValue());
        }

        // TTL 설정
        setTtlForSalesKey(storeId, date);
    }

    /** 레디스 TTL 만료 메서드 */
    private void setTtlForSalesKey(Long storeId, String date) {
        Duration ttl = Duration.ofHours(SALES_TTL_HOURS);

        redisTemplate.expire(String.format(SUM_KEY, storeId, date), ttl);
        redisTemplate.expire(String.format(SUM_GROSS_KEY, storeId, date), ttl);
        redisTemplate.expire(String.format(SUM_CANCEL_KEY, storeId, date), ttl);
        redisTemplate.expire(String.format(SUM_DELIVERY_KEY, storeId, date), ttl);

        redisTemplate.expire(String.format(COUNT_PAYMENT_KEY, storeId, date), ttl);
        redisTemplate.expire(String.format(COUNT_CANCEL_KEY, storeId, date), ttl);

        for(int hour =0; hour < 24; hour++){
            redisTemplate.expire(String.format(HOURLY_KEY, storeId, date, hour), ttl);
            redisTemplate.expire(String.format(COUNT_HOURLY_PAYMENT_KEY, storeId, date, hour), ttl);
            redisTemplate.expire(String.format(COUNT_HOURLY_CANCEL_KEY, storeId, date, hour), ttl);
            redisTemplate.expire(String.format(RATE_CANCEL_KEY, storeId, date, hour), ttl);
        }
    }

    /** 취소율 계산 메서드 */
    private double calcCancelRate(Integer paymentCount, Integer cancelCount) {
        int pay = paymentCount != null ? paymentCount : 0;
        int cancel = cancelCount != null ? cancelCount : 0;
        return pay > 0 ? (double) cancel / pay * 100 : 0.0;
    }

    /** redis value -> int 값으로 변경 메서드 */
    @Override
    public int getIntValue(String key) {
        String value = redisTemplate.opsForValue().get(key);
        return value != null ? (int) Double.parseDouble(value) : 0;
    }

    @Override
    public SalesStatsResponseDto getSalesStats(Long storeId, String date) {

        // Redis에서 기본 통계 조회
        Integer totalSalesVal = getIntValue(String.format(SUM_KEY, storeId, date));
        Integer paymentCountVal = getIntValue(String.format(COUNT_PAYMENT_KEY, storeId, date));
        Integer cancelCountVal = getIntValue(String.format(COUNT_CANCEL_KEY, storeId, date));
        Integer deliverySalesVal =  getIntValue(String.format(SUM_DELIVERY_KEY, storeId, date));


        // 시간대별 매출 조회
        List<SalesStatsResponseDto.HourlySales> hourlySales = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
//            String key = String.format(HOURLY_KEY, storeId, date, hour);
            Integer sales = getIntValue(String.format(HOURLY_KEY, storeId, date, hour));
            Integer hourlyPayment = getIntValue(String.format(COUNT_HOURLY_PAYMENT_KEY, storeId, date, hour));
            Integer hourlyCancel = getIntValue(String.format(COUNT_HOURLY_CANCEL_KEY, storeId, date, hour));

            // 시간대 취소율 계산 후 레디스에 저장
            double cancelRate = calcCancelRate(hourlyPayment, hourlyCancel);
            redisTemplate.opsForValue().set(
                    String.format(RATE_CANCEL_KEY, storeId, date, hour),
                    String.valueOf(cancelRate)
            );

            hourlySales.add(SalesStatsResponseDto.HourlySales.builder()
                    .hour(hour)
                    .sales(sales)
                    .paymentCount(hourlyPayment)
                    .cancelCount(hourlyCancel)
                    .cancelRate(cancelRate)
                    .build()
            );
        }

        // DTO 생성
        return SalesStatsResponseDto.builder()
                .storeId(storeId)
                .date(date)
                .totalSales(totalSalesVal)
                .paymentCount(paymentCountVal)
                .cancelCount(cancelCountVal)
                .deliverySales(deliverySalesVal)
                .hourlySales(hourlySales)
                .build();

    }
}
