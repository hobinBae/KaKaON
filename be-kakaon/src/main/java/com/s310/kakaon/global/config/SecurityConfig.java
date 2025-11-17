package com.s310.kakaon.global.config;

import com.s310.kakaon.global.jwt.JwtAuthenticationEntryPoint;
import com.s310.kakaon.global.jwt.JwtAuthenticationFilter;
import com.s310.kakaon.global.oauth2.CustomOAuth2UserService;
import com.s310.kakaon.global.oauth2.OAuth2LoginFailureHandler;
import com.s310.kakaon.global.oauth2.OAuth2LoginSuccessHandler;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Slf4j
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomOAuth2UserService customOAuth2UserService;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
    private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                )
                .authorizeHttpRequests(auth -> auth
                        // 인증 없이 접근을 허용할 경로들을 먼저 정의
                        .requestMatchers(
                                "/swagger", "/swagger-ui.html", "/swagger-ui/**",
                                "/api-docs", "/api-docs/**", "/v3/api-docs/**",
                                "/oauth2/**", "/login/oauth2/**",
                                "/api/v1/auth/refresh", "/auth/callback"
                        ).permitAll()
                        // 그 외 /api/v1/ 로 시작하는 모든 경로는 인증을 요구
                        .requestMatchers("/api/v1/**").authenticated()
                        // 나머지 모든 요청에 대해서도 인증을 요구 (선택적이지만 안전함)
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureHandler(oAuth2LoginFailureHandler)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
