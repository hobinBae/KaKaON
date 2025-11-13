package com.s310.kakaon.domain.alert.service;

import com.s310.kakaon.domain.alert.entity.Alert;
import com.s310.kakaon.domain.alert.repository.AlertRepository;
import com.s310.kakaon.domain.store.entity.AlertRecipient;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailSendingService {

    private final MailService mailservice;
    private final AlertRepository alertRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendAlertMails(Alert alert) {
        //detached된 alert 대신 다시 DB에서 가져오기
        Alert persisted = alertRepository.findById(alert.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.ALERT_NOT_FOUND));

        Store store = persisted.getStore();

        List<AlertRecipient> alertRecipients = store.getAlertRecipient();

        // 메일 내용 구성
        String subject = "[이상거래 탐지 알림] " + persisted.getAlertType().getDescription();
        String text = String.format(
                "가맹점: %s%n이상 탐지 유형: %s%n설명: %s%n발생 시각: %s",
                store.getName(),
                persisted.getAlertType().getDescription(),
                persisted.getDescription(),
                persisted.getDetectedAt().format(DateTimeFormatter.ofPattern("yy.MM.dd HH:mm"))
        );

        try {
            mailservice.sendAlertMail(store.getMember().getEmail(), subject, text);

            for (AlertRecipient alertRecipient : alertRecipients) {
                if (Boolean.TRUE.equals(alertRecipient.getActive())) {
                    mailservice.sendAlertMail(alertRecipient.getEmail(), subject, text);
                }
            }


            persisted.updateEmailSent();

        } catch (Exception e) {
            log.warn("메일 전송 실패", e);
        }
    }
}
