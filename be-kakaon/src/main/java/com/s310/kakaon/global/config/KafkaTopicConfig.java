package com.s310.kakaon.global.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Value("${kafka.topics.payment-events}")
    private String paymentTopic;

    @Bean
    public NewTopic paymentEventsTopic() {
        return TopicBuilder
                .name(paymentTopic)
                .partitions(3)  // 파티션 개수
                .replicas(1)    // 복제본 개수
                .build();
    }
}