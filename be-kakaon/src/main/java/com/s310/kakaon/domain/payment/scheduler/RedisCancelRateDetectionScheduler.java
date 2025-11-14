package com.s310.kakaon.domain.payment.scheduler;


import com.s310.kakaon.domain.analytics.dto.SalesStatsResponseDto;
import com.s310.kakaon.domain.payment.service.SalesCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisCancelRateDetectionScheduler implements CancelRateDetectionScheduler {

    private final SalesCacheService salesCacheService;
    private static final String REDIS_KEY_PREFIX = "store:operation:startTime:";

    @Override
    public void detectCancelRateIncrease() {


    }
}
