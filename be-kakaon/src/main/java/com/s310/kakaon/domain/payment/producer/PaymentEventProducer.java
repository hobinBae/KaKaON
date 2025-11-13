package com.s310.kakaon.domain.payment.producer;


import com.s310.kakaon.domain.payment.dto.PaymentEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventProducer {

    @Value("${kafka.topics.payment-events}")
    private String paymentTopic;

    private final KafkaTemplate<String, PaymentEventDto> kafkaTemplate;

    public void sendPaymentEvent(PaymentEventDto event) {
        try {
            CompletableFuture<SendResult<String, PaymentEventDto>> future =
                    kafkaTemplate.send(paymentTopic, event.getPaymentId().toString(), event);  // send(토픽명, 키, 값)

            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("Sent payment event: paymentId={}, offset={}",
                            event.getPaymentId(),
                            result.getRecordMetadata().offset());
                } else {
                    log.error("Failed to send payment event: paymentId={}",
                            event.getPaymentId(), ex);
                }
            });
        } catch (Exception e) {
            log.error("Error sending payment event: paymentId={}", event.getPaymentId(), e);
        }
    }
}