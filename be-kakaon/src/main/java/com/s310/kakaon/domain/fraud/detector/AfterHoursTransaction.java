package com.s310.kakaon.domain.fraud.detector;

import static com.s310.kakaon.global.util.Util.generateAlertId;

import com.s310.kakaon.domain.alert.dto.AlertEvent;
import com.s310.kakaon.domain.alert.entity.AlertType;
import com.s310.kakaon.domain.alert.repository.AlertRepository;
import com.s310.kakaon.domain.payment.dto.PaymentEventDto;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AfterHoursTransaction implements FraudDetector{
    private static final String REDIS_KEY_PREFIX = "store:operation:startTime:";
    private final StringRedisTemplate stringRedisTemplate;
    private final AlertRepository alertRepository;
    @Override
    public List<AlertEvent> detect(PaymentEventDto event) {
        if (event.getStoreId() == null) {
            return Collections.emptyList();
        }

        String redisKey = REDIS_KEY_PREFIX + event.getStoreId();
        boolean open = Boolean.TRUE.equals(stringRedisTemplate.hasKey(redisKey));
        if (!open) {
            AlertEvent alertEvent = AlertEvent.builder()
                    .alertUuid(generateAlertId(alertRepository))
                    .storeId(event.getStoreId())
                    .storeName(event.getStoreName())
                    .alertType(getAlertType())
                    .description("영업시간 외 거래가 발생했습니다.")
                    .detectedAt(event.getApprovedAt())
                    .paymentId(event.getPaymentId())
                    .build();

            return List.of(alertEvent);
        }
        return Collections.emptyList();
    }

    @Override
    public AlertType getAlertType() {
        return AlertType.OUT_OF_BUSINESS_HOUR;
    }

    @Override
    public void cleanup() {
        FraudDetector.super.cleanup();
    }
}
