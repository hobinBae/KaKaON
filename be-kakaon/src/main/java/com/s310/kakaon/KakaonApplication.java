package com.s310.kakaon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableJpaAuditing
@EnableScheduling
@SpringBootApplication
public class KakaonApplication {

    public static void main(String[] args) {
        SpringApplication.run(KakaonApplication.class, args);
    }

}
