package com.s310.kakaon.global.config;

import java.util.concurrent.Executor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "alertExecutor")
    public Executor alertExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);         // 최소 스레드 수
        executor.setMaxPoolSize(8);          // 최대 스레드 수
        executor.setQueueCapacity(100);      // 대기 큐 용량
        executor.setThreadNamePrefix("AlertExecutor-");
        executor.setWaitForTasksToCompleteOnShutdown(true); // 안전 종료
        executor.setAwaitTerminationSeconds(10);
        executor.initialize();
        return executor;
    }

    @Bean(name = "mailExecutor")
    public Executor mailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);        // 동시에 2개까지 메일 전송
        executor.setMaxPoolSize(5);         // 최대 5개 스레드
        executor.setQueueCapacity(50);      // 대기 큐 (메일 50개까지)
        executor.setThreadNamePrefix("MailExecutor-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(10);
        executor.initialize();
        return executor;
    }

    @Bean(name = "csvUploadExecutor")
    public Executor csvUploadExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("CsvUploadExecutor-");
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        return executor;
    }
}
