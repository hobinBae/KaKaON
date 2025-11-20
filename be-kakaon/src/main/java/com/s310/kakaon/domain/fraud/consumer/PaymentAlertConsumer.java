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
import org.springframework.context.ApplicationEventPublisher;
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
    private final List<FraudDetector> fraudDetectors;
    private final ApplicationEventPublisher eventPublisher;

    @KafkaListener(topics = "payment-events", groupId = "payment-alert-group")
    @Transactional
    public void consumePaymentEvent(PaymentEventDto event) {
        log.info("Consumed payment event: paymentId={}, authorizationNo={}",
                event.getPaymentId(), event.getAuthorizationNo());
        try {
            for (FraudDetector detector : fraudDetectors) {
                List<AlertEvent> alertEvents = detector.detect(event);

                for (AlertEvent ae : alertEvents) {
                    log.info("[CONSUMER] 이상거래 탐지됨, AlertEvent 발행: storeId={}, type={}",
                            ae.getStoreId(), ae.getAlertType());
                    // 🔥 여기서만 이벤트 발행하고 나머지는 Listener에게 맡김
                    eventPublisher.publishEvent(ae);
                }
            }
        } catch (Exception e) {
            log.error("Error processing payment event: paymentId={}", event.getPaymentId(), e);
        }
    }
}