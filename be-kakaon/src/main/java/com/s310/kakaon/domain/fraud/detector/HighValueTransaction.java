package com.s310.kakaon.domain.fraud.detector;

import static com.s310.kakaon.global.util.Util.generateAlertId;

import com.s310.kakaon.domain.alert.dto.AlertEvent;
import com.s310.kakaon.domain.alert.entity.Alert;
import com.s310.kakaon.domain.alert.entity.AlertType;
import com.s310.kakaon.domain.alert.repository.AlertRepository;
import com.s310.kakaon.domain.payment.dto.PaymentEventDto;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.payment.repository.PaymentRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class HighValueTransaction implements FraudDetector{
    private static final String REDIS_KEY_PREFIX = "store:operation:startTime:";
    private final StringRedisTemplate stringRedisTemplate;
    private final AlertRepository alertRepository;

    @Override
    public List<AlertEvent> detect(PaymentEventDto event) {
        String redisKey = REDIS_KEY_PREFIX + event.getStoreId();
        Object avgObj = stringRedisTemplate.opsForHash().get(redisKey, "avgPaymentAmountPrevMonth");

        if(avgObj != null){
            double avgAmount = Double.parseDouble(avgObj.toString());
            double currentAmount = event.getAmount();

            if (avgAmount > 0 && currentAmount >= avgAmount * 10) {
                AlertEvent alertEvent = AlertEvent.builder()
                        .alertUuid(generateAlertId(alertRepository))
                        .storeId(event.getStoreId())
                        .storeName(event.getStoreName())
                        .alertType(getAlertType())
                        .description(String.format(
                                "결제 금액 %,d원이 전월 평균(%,.0f원)의 10배이상을 초과했습니다.",
                                (long) currentAmount, avgAmount))
                        .detectedAt(event.getApprovedAt())
                        .paymentId(event.getPaymentId())
                        .build();
                return List.of(alertEvent);
            }
        }
        return Collections.emptyList();
    }

    @Override
    public AlertType getAlertType() {
        return AlertType.HIGH_AMOUNT_SPIKE;
    }

    @Override
    public void cleanup() {
        FraudDetector.super.cleanup();
    }
}
