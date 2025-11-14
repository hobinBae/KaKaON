package com.s310.kakaon.domain.alert.listener;

import com.s310.kakaon.domain.alert.dto.AlertEvent;
import com.s310.kakaon.domain.alert.entity.Alert;
import com.s310.kakaon.domain.alert.service.AlertService;
import com.s310.kakaon.domain.alert.service.MailSendingService;
import com.s310.kakaon.domain.store.entity.AlertRecipient;
import com.s310.kakaon.domain.store.entity.Store;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class AlertEventListener {
    private final AlertService alertService;
    private final MailSendingService mailSendingService;

//    @Async("alertExecutor")
    //결제 내역이 커밋되기 전에 이 안에 로직이 실행해서 결제내역을 찾을 수 없음
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(AlertEvent event){

        log.info("[AlertEvent 수신] {}", event);

        Alert alert = alertService.createAlert(event);

        mailSendingService.sendAlertMails(alert);
    }
}
