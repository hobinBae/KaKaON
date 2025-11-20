package com.s310.kakaon.global.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // 환경 변수에서 쉼표로 구분된 origins 파싱
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        config.setAllowedOrigins(origins);

        // 허용할 HTTP 메서드
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));

        // 모든 헤더 허용
        config.setAllowedHeaders(List.of("*"));

        // 쿠키 및 인증 정보 전송 허용
        config.setAllowCredentials(true);

        // 프론트엔드에서 접근 가능한 응답 헤더 (JWT 토큰 등)
        config.setExposedHeaders(List.of("Authorization", "Set-Cookie"));

        // Preflight 요청 캐싱 시간 (1시간)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
