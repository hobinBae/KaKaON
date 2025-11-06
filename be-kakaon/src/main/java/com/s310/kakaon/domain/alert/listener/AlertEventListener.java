package com.s310.kakaon.domain.alert.listener;

import com.s310.kakaon.domain.alert.dto.AlertEvent;
import com.s310.kakaon.domain.alert.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertEventListener {
    private final AlertService alertService;

    @EventListener
    public void handle(AlertEvent event){
        log.info("[AlertEvent 수신] {}", event);
        alertService.createAndSendAlert(event);
    }
}
