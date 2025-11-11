package com.s310.kakaon.domain.fraud.consumer;

import com.s310.kakaon.domain.alert.dto.AlertEvent;
import com.s310.kakaon.domain.alert.entity.Alert;
import com.s310.kakaon.domain.alert.repository.AlertRepository;
import com.s310.kakaon.domain.alert.service.MailService;
import com.s310.kakaon.domain.fraud.detector.FraudDetector;
import com.s310.kakaon.domain.payment.dto.PaymentEventDto;
import com.s310.kakaon.domain.payment.entity.AlertPayment;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.payment.repository.AlertPaymentRepository;
import com.s310.kakaon.domain.payment.repository.PaymentRepository;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentAlertConsumer {

    private final AlertRepository alertRepository;
    private final AlertPaymentRepository alertPaymentRepository;
    private final MailService mailService;
    private final List<FraudDetector> fraudDetectors;
    private final PaymentRepository paymentRepository;
    private final StoreRepository storeRepository;

    @KafkaListener(topics = "payment-events", groupId = "payment-alert-group")
    @Transactional
    public void consumePaymentEvent(PaymentEventDto event) {
        log.info("Consumed payment event: paymentId={}, authorizationNo={}",
                event.getPaymentId(), event.getAuthorizationNo());

        try {
            // 모든 이상거래 탐지 룰 실행
            for (FraudDetector detector : fraudDetectors) {
                List<AlertEvent> alertEvents = detector.detect(event);

                if (!alertEvents.isEmpty()) {
                    log.info("Detected {} alert events by {}",
                            alertEvents.size(), detector.getClass().getSimpleName());

                    // groupId로 그룹핑 (같은 이상거래 케이스는 같은 groupId를 가짐)
                    Map<String, List<AlertEvent>> groupedAlerts = alertEvents.stream()
                            .collect(Collectors.groupingBy(AlertEvent::getGroupId));

                    // 각 그룹(이상거래 케이스)마다 처리
                    for (Map.Entry<String, List<AlertEvent>> entry : groupedAlerts.entrySet()) {
                        String groupId = entry.getKey();
                        List<AlertEvent> relatedEvents = entry.getValue();

                        log.info("Processing alert group: groupId={}, events count={}",
                                groupId, relatedEvents.size());

                        // Alert 및 관련 AlertPayment 저장
                        Alert savedAlert = saveAlertWithPayments(relatedEvents);

                        // 메일 발송
                        sendAlertEmail(savedAlert);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error processing payment event: paymentId={}", event.getPaymentId(), e);
        }
    }

    /**
     * Alert와 관련된 모든 AlertPayment를 저장
     */
    private Alert saveAlertWithPayments(List<AlertEvent> relatedEvents) {
        try {
            // 첫 번째 이벤트 기준으로 Alert 생성
            AlertEvent firstEvent = relatedEvents.get(0);

            // 1. Store 조회
            Store store = storeRepository.findById(firstEvent.getStoreId())
                    .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

            // 2. Alert 엔티티 생성 및 저장
            Alert alert = Alert.builder()
                    .store(store)
                    .alertUuid(UUID.randomUUID().toString().substring(0, 20)) // Alert마다 고유한 UUID
                    .alertType(firstEvent.getAlertType())
                    .description(firstEvent.getDescription())
                    .detectedAt(firstEvent.getDetectedAt())
                    .emailSent(false)
                    .checked(false)
                    .build();

            Alert savedAlert = alertRepository.save(alert);
            log.info("Alert saved: alertId={}, uuid={}, type={}, storeId={}, relatedPayments={}",
                    savedAlert.getId(), savedAlert.getAlertUuid(),
                    savedAlert.getAlertType(), savedAlert.getStore().getId(),
                    relatedEvents.size());

            // 3. 관련된 모든 결제에 대해 AlertPayment 저장
            // AlertPayment 저장 시 재시도 로직
            for (AlertEvent event : relatedEvents) {
                if (event.getPaymentId() != null) {
                    Payment payment = findPaymentWithRetry(event.getPaymentId(), 10, 200);

                    if (payment != null) {
                        AlertPayment alertPayment = AlertPayment.builder()
                                .alert(savedAlert)
                                .payment(payment)
                                .build();

                        alertPaymentRepository.save(alertPayment);
                        log.info("AlertPayment saved: alertId={}, paymentId={}",
                                savedAlert.getId(), payment.getId());
                    } else {
                        log.warn("Payment not found after retries: paymentId={}", event.getPaymentId());
                    }
                }
            }

            return savedAlert;

        } catch (Exception e) {
            log.error("Failed to save alert with payments: {}", relatedEvents, e);
            throw e;
        }
    }

    /**
     * Payment 조회 재시도 로직
     */
    private Payment findPaymentWithRetry(Long paymentId, int maxRetries, long delayMs) {
        for (int i = 0; i < maxRetries; i++) {
            Optional<Payment> payment = paymentRepository.findById(paymentId);
            if (payment.isPresent()) {
                return payment.get();
            }

            if (i < maxRetries - 1) {
                try {
                    Thread.sleep(delayMs);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }
        return null;
    }

    /**
     * 이상거래 알림 메일 발송
     */
    private void sendAlertEmail(Alert alert) {
        try {
            String to = alert.getStore().getMember().getEmail();

            String subject = String.format("[Kakaon 이상거래 알림] %s - %s",
                    alert.getAlertType().name(),
                    alert.getStore().getName());

            String text = String.format(
                    "안녕하세요, %s님\n\n" +
                            "이상거래가 감지되었습니다.\n\n" +
                            "알림 유형: %s\n" +
                            "감지 시각: %s\n\n" +
                            "상세 내용:\n%s\n\n" +
                            "자세한 내용은 Kakaon 관리자 페이지에서 확인하실 수 있습니다.",
                    alert.getStore().getName(),
                    alert.getAlertType().getDescription(),
                    alert.getDetectedAt(),
                    alert.getDescription()
            );

            mailService.sendAlertMail(to, subject, text);

            // 메일 발송 완료 표시
            alert.updateEmailSent();
            alertRepository.save(alert);

            log.info("Alert email sent: alertId={}, to={}", alert.getId(), to);

        } catch (Exception e) {
            log.error("Failed to send alert email: alertId={}", alert.getId(), e);
        }
    }
}