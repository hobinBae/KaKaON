package com.s310.kakaon.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;

import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        String jwt = "JWT";
        SecurityRequirement securityRequirement = new SecurityRequirement().addList(jwt);
        Components components =
                new Components()
                        .addSecuritySchemes(
                                jwt,
                                new SecurityScheme()
                                        .name(jwt)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT"));
        return new OpenAPI()
                .components(components)
                .info(apiInfo())
                .addSecurityItem(securityRequirement)
                .servers(List.of(new Server().url("/")));
    }

    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("00-All")
                .pathsToMatch("/api/v1/**")
                .packagesToScan("com.s310.kakaon.domain")
                .build();
    }

    @Bean
    public GroupedOpenApi memberApi() {
        return GroupedOpenApi.builder().group("01-Members").pathsToMatch("/api/v1/members/**").build();
    }

    @Bean
    public GroupedOpenApi authApi() {
        return GroupedOpenApi.builder().group("02-Auth").pathsToMatch("/api/v1/auth/**").build();
    }

    @Bean
    public GroupedOpenApi paymentApi() {
        return GroupedOpenApi.builder().group("03-Payment").pathsToMatch("/api/v1/payments/**").build();
    }

    @Bean
    public GroupedOpenApi storeApi() {
        return GroupedOpenApi.builder().group("04-stores").pathsToMatch("/api/v1/stores/**").build();
    }

    @Bean
    public GroupedOpenApi orderApi() {
        return GroupedOpenApi.builder().group("05-orders").pathsToMatch("/api/v1/orders/**").build();
    }

    @Bean
    public GroupedOpenApi menuApi() {
        return GroupedOpenApi.builder().group("06-menus").pathsToMatch("/api/v1/menus/**").build();
    }

    @Bean
    public GroupedOpenApi paymentInfoApi() {
        return GroupedOpenApi.builder().group("07-payment-info").pathsToMatch("/api/v1/payment-info/**").build();
    }





    private Info apiInfo() {
        return new Info()
                .title("Kakaon API Document") // API의 제목
                .description("카카오페이 가맹점 관리 프로젝트 API 명세서입니다.") // API에 대한 설명
                .version("1.0.0"); // API의 버전
    }









}
