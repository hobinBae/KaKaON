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
import java.util.Optional;
import java.util.UUID;

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
            for (FraudDetector detector : fraudDetectors) {
                List<AlertEvent> alertEvents = detector.detect(event);
                // 탐지기 1회당 보통 1개만 오지만, 혹시 여러 개여도 개별 처리
                for (AlertEvent ae : alertEvents) {
                    Alert savedAlert = saveAlertWithPayments(ae); // 단일 이벤트 기준
                    sendAlertEmail(savedAlert);
                }
            }
        } catch (Exception e) {
            log.error("Error processing payment event: paymentId={}", event.getPaymentId(), e);
        }
    }

    private Alert saveAlertWithPayments(AlertEvent event) {
        try {
            log.info("[CONSUMER] Start saving alert: storeId={}, relatedIds={}",
                    event.getStoreId(), event.getRelatedPaymentIds());

            Store store = storeRepository.findById(event.getStoreId())
                    .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

            Alert alert = Alert.builder()
                    .store(store)
                    .alertUuid(UUID.randomUUID().toString().substring(0, 20))
                    .alertType(event.getAlertType())
                    .description(event.getDescription())
                    .detectedAt(event.getDetectedAt())
                    .emailSent(false)
                    .checked(false)
                    .build();

            Alert savedAlert = alertRepository.save(alert);

            //  윈도우 내 전체 결제 저장
            List<Long> relatedIds = event.getRelatedPaymentIds();
            if (relatedIds != null && !relatedIds.isEmpty()) {
                for (Long pid : relatedIds) {
                    log.info("[CONSUMER] Trying to save AlertPayment: alertId=?, paymentId={}", savedAlert.getId(), pid);
                    Payment payment = findPaymentWithRetry(pid, 10, 200);
                    if (payment != null) {
                        log.info("[CONSUMER] Found payment entity: {}", payment.getId());
                        // (권장) 멱등성 보호
                        if (!alertPaymentRepository.existsByAlertIdAndPaymentId(savedAlert.getId(), payment.getId())) {
                            alertPaymentRepository.save(
                                    AlertPayment.builder().alert(savedAlert).payment(payment).build()
                            );
                            log.info("AlertPayment saved: alertId={}, paymentId={}", savedAlert.getId(), payment.getId());
                        }
                    } else {
                        log.warn("[CONSUMER] Payment not found after retry: {}", pid);
                        log.warn("Payment not found after retries: paymentId={}", pid);
                    }
                }
            } else {
                log.warn("[CONSUMER] relatedIds is null or empty for alert={}", savedAlert.getId());
                // 방어 로직: 리스트가 비면 트리거 결제라도 저장
                if (event.getPaymentId() != null) {
                    Payment payment = findPaymentWithRetry(event.getPaymentId(), 15, 300);
                    if (payment != null && !alertPaymentRepository.existsByAlertIdAndPaymentId(savedAlert.getId(), payment.getId())) {
                        alertPaymentRepository.save(
                                AlertPayment.builder().alert(savedAlert).payment(payment).build()
                        );
                    }
                }
                log.warn("No relatedPaymentIds provided for alert: alertId={}", savedAlert.getId());
            }

            return savedAlert;

        } catch (Exception e) {
            log.error("Failed to save alert with payments: {}", event, e);
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