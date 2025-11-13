package com.s310.kakaon.domain.payment.listener;

import com.s310.kakaon.domain.payment.dto.PaymentEventDto;
import com.s310.kakaon.domain.payment.producer.PaymentEventProducer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventPublisher {

    private final PaymentEventProducer paymentEventProducer;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePaymentEvent(PaymentEventDto event) {
        log.info("Publishing payment event after transaction commit: paymentId={}", event.getPaymentId());
        paymentEventProducer.sendPaymentEvent(event);
    }
}