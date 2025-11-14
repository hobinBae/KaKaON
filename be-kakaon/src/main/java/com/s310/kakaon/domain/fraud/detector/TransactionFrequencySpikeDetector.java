package com.s310.kakaon.domain.fraud.detector;


import com.s310.kakaon.domain.alert.dto.AlertEvent;
import com.s310.kakaon.domain.alert.entity.AlertType;
import com.s310.kakaon.domain.payment.dto.PaymentEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionFrequencySpikeDetector implements FraudDetector {

    @Qualifier("paymentEventRedisTemplate")
    private final RedisTemplate<String, PaymentEventDto> paymentEventRedisTemplate;

    // 🔧 설정 값
    private static final int TIME_WINDOW_MINUTES = 1;      // 1분 이내
    private static final int THRESHOLD_COUNT = 10;         // 10건 이상
    private static final String REDIS_KEY_PREFIX = "fraud:freq:";

    @Override
    public List<AlertEvent> detect(PaymentEventDto event) {

        // 필수 값 체크 (시간/가맹점 정보 없으면 스킵)
        if (event.getStoreId() == null || event.getApprovedAt() == null) {
            return Collections.emptyList();
        }

        // (선택) 승인 상태만 대상으로 하고 싶으면 주석 해제
        // if (!"APPROVED".equalsIgnoreCase(event.getStatus())) {
        //     return Collections.emptyList();
        // }

        String redisKey = generateRedisKey(event);

        // 1) 현재 이벤트 Redis에 적재 + TTL 설정
        paymentEventRedisTemplate.execute((RedisCallback<Object>) connection -> {
            connection.multi();

            paymentEventRedisTemplate.opsForList().rightPush(redisKey, event);
            // 1분 윈도우 + 버퍼 2분
            paymentEventRedisTemplate.expire(redisKey, Duration.ofMinutes(TIME_WINDOW_MINUTES + 2));

            connection.exec();
            return null;
        });

        // 2) 윈도우 내 이벤트 조회
        List<PaymentEventDto> rawList =
                paymentEventRedisTemplate.opsForList().range(redisKey, 0, -1);

        if (rawList == null || rawList.isEmpty()) {
            return Collections.emptyList();
        }

        LocalDateTime windowStart = event.getApprovedAt().minusMinutes(TIME_WINDOW_MINUTES);

        // approvedAt 기준으로 윈도우 내 데이터만 필터링 + 정렬
        List<PaymentEventDto> recentList = rawList.stream()
                .filter(p -> p.getApprovedAt() != null &&
                        !p.getApprovedAt().isBefore(windowStart))
                .sorted(Comparator.comparing(PaymentEventDto::getApprovedAt))
                .toList();

        // 아직 10건이 안 됐다면 이상거래 아님
        if (recentList.size() < THRESHOLD_COUNT) {
            return Collections.emptyList();
        }

        // 3) 관련 결제 ID 리스트 구성 (윈도우 내 모든 결제)
        List<Long> relatedPaymentIds = recentList.stream()
                .map(PaymentEventDto::getPaymentId)
                .toList();

        PaymentEventDto first = recentList.get(0);
        PaymentEventDto last = recentList.get(recentList.size() - 1);

        String description = String.format(
                "[거래 빈도 급증] 동일 가맹점에서 %d분 이내 %d건 이상의 결제가 발생했습니다.\n" +
                        "- 가맹점: %s (매장ID: %d)\n" +
                        "- 첫 결제 시각: %s\n" +
                        "- 마지막 결제 시각: %s\n" +
                        "- 총 결제 건수: %d건\n" +
                        "- 관련 결제 ID: %s",
                TIME_WINDOW_MINUTES,
                recentList.size(),
                event.getStoreName(), event.getStoreId(),
                first.getApprovedAt(),
                last.getApprovedAt(),
                recentList.size(),
                relatedPaymentIds
        );

        LocalDateTime detectedAt = LocalDateTime.now();
        String groupId = generateGroupId(redisKey, recentList);

        AlertEvent alertEvent = AlertEvent.builder()
                .groupId(groupId)
                .storeId(event.getStoreId())
                .storeName(event.getStoreName())
                .alertType(getAlertType())   // TRANSACTION_FREQUENCY_SPIKE
                .description(description)
                .detectedAt(detectedAt)
                .paymentId(event.getPaymentId())      // 트리거 결제
                .relatedPaymentIds(relatedPaymentIds) // 1분 윈도우 내 모든 결제
                .build();

        log.info("[DETECTOR-FREQ] Detected transaction frequency spike: storeId={}, groupId={}, count={}",
                event.getStoreId(), groupId, recentList.size());

        return List.of(alertEvent);
    }

    @Override
    public AlertType getAlertType() {
        return AlertType.TRANSACTION_FREQUENCY_SPIKE;
    }

    private String generateRedisKey(PaymentEventDto event) {
        // "fraud:freq:{storeId}"
        return String.format("%s%d",
                REDIS_KEY_PREFIX,
                event.getStoreId()
        );
    }

    private String generateGroupId(String redisKey, List<PaymentEventDto> payments) {
        // 같은 가맹점 + 동일 빈도 급증 케이스를 하나의 그룹으로 식별
        return String.format("FREQ-%s-%d",
                redisKey.replace(REDIS_KEY_PREFIX, ""),
                payments.get(0).getPaymentId());
    }

    @Override
    public void cleanup() {
        log.debug("Redis TTL에 의해 자동 정리됩니다.");
    }
}