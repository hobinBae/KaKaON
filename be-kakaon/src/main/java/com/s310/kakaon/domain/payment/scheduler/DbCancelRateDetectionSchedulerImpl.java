package com.s310.kakaon.domain.payment.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DbCancelRateDetectionSchedulerImpl implements CancelRateDetectionScheduler{

    @Override
    public void detectCancelRateIncrease() {

    }
}
