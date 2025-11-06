package com.s310.kakaon.domain.payment.scheduler;

import com.s310.kakaon.domain.alert.dto.AlertEvent;
import com.s310.kakaon.domain.alert.entity.AlertType;
import com.s310.kakaon.domain.payment.dto.CancelRateAnomalyDto;
import com.s310.kakaon.domain.payment.service.PaymentService;
import com.s310.kakaon.domain.payment.service.PaymentServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DbCancelRateDetectionSchedulerImpl implements CancelRateDetectionScheduler{

    private final PaymentService paymentService;
    private final ApplicationEventPublisher publisher;

    @Override
    @Scheduled(cron = "0 0 * * * *")
//    @Scheduled(cron = "0 * * * * *") //  매 분 0초마다 xptmxm
    public void detectCancelRateIncrease() {
        log.info("[Batch] 최근 1시간 취소율 이상 탐지 시작");

        List<CancelRateAnomalyDto> anomalies = paymentService.findHourlyCancelRateAnomalies();

        for (CancelRateAnomalyDto anomaly : anomalies) {

            LocalDateTime now = LocalDateTime.now();
            LocalDateTime oneHourAgo = now.minusHours(1);
            int startHour = oneHourAgo.getHour();
            int endHour = now.getHour();

            AlertEvent event = AlertEvent.builder()
                        .alertUuid(UUID.randomUUID().toString().substring(0, 20))
                        .storeId(anomaly.getStoreId())
                        .storeName(anomaly.getStoreName())
                        .alertType(AlertType.CANCEL_RATE_SPIKE)
                        // description은 수정해야함
                        .description(String.format(
                                "전주 같은 시간대(%02d시~%02d시) 대비 취소율 %.2f%% → %.2f%% (%.2f%%p 증가)",
                                startHour,
                                endHour,
                                anomaly.getLastWeekCancelRate(),
                                anomaly.getThisWeekCancelRate(),
                                anomaly.getIncreasePercent()))
                        .detectedAt(LocalDateTime.now())
                        .build();
                publisher.publishEvent(event);
                log.info("[AlertEvent 발행] {}", event.getDescription());


        }
    }
}
