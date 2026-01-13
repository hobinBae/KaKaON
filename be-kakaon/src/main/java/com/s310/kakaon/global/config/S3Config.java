//package com.s310.kakaon.global.config;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
//import software.amazon.awssdk.regions.Region;
//import software.amazon.awssdk.services.s3.S3Client;
//
//@Configuration
//public class S3Config {
//
//    @Value("${app.aws.s3.region}")
//    private String region;
//
//    @Bean
//    public S3Client s3Client() {
//        return S3Client.builder()
//                .region(Region.of(region))
//                // AWS_ACCESS_KEY_ID / SECRET_KEY 를 환경변수에서 자동으로 읽음
//                .credentialsProvider(DefaultCredentialsProvider.create())
//                .build();
//    }
//}