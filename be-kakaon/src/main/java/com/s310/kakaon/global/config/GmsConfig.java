package com.s310.kakaon.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

// GMS API 통신을 위한 WebClient 설정을 정의했음
@Configuration
public class GmsConfig {

    @Value("${gms.key}")
    private String gmsKey;

    private static final String GMS_API_BASE_URL = "https://gms.ssafy.io/gmsapi/api.openai.com/v1";

    @Bean
    public WebClient gmsWebClient() {
        return WebClient.builder()
                .baseUrl(GMS_API_BASE_URL)
                .defaultHeader("Authorization", "Bearer " + gmsKey)
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}
