package com.s310.kakaon.domain.alert.service;

import com.s310.kakaon.domain.alert.dto.AlertEvent;
import com.s310.kakaon.domain.alert.entity.Alert;
import com.s310.kakaon.domain.alert.repository.AlertRepository;
import com.s310.kakaon.domain.store.entity.AlertRecipient;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertServiceImpl implements AlertService{
    private final AlertRepository alertRepository;
    private final StoreRepository storeRepository;
    private final MailService mailService;

    @Transactional
    public void createAndSendAlert(AlertEvent event) {
        Store store = storeRepository.findById(event.getStoreId())
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        List<AlertRecipient> alertRecipients = store.getAlertRecipient();

        Alert alert = Alert.builder()
                .alertUuid(event.getAlertUuid())
                .store(store)
                .alertType(event.getAlertType())
                .description(event.getDescription())
                .detectedAt(event.getDetectedAt())
                .emailSent(false)
                .checked(false)
                .build();

        // 메일 내용 구성
        String subject = "[이상거래 탐지 알림] " + alert.getAlertType();
        String text = String.format(
                "가맹점: %s\n이상 탐지 유형: %s\n설명: %s\n발생 시각: %s",
                store.getName(),
                alert.getAlertType(),
                alert.getDescription(),
                alert.getDetectedAt()
        );

        // 가맹점 이메일로 전송 (Store 엔티티에 email 필드 있다고 가정)
        mailService.sendAlertMail(store.getMember().getEmail(), subject, text);

        alertRepository.save(alert);

        if(!alertRecipients.isEmpty()){
            for (AlertRecipient alertRecipient : alertRecipients) {
                if(alertRecipient.getActive()){
                    mailService.sendAlertMail(alertRecipient.getEmail(), subject, text);
                }
            }
        }

        alert.updateEmailSent();
    }
}
