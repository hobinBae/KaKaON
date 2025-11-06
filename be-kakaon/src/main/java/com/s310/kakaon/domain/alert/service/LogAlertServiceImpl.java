package com.s310.kakaon.domain.alert.service;

import com.s310.kakaon.domain.alert.dto.AlertEvent;
import com.s310.kakaon.domain.alert.entity.Alert;
import com.s310.kakaon.domain.alert.repository.AlertRepository;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LogAlertServiceImpl implements AlertService{
    private final AlertRepository alertRepository;
    private final StoreRepository storeRepository;

    @Transactional
    public void createAndSendAlert(AlertEvent event) {
        Store store = storeRepository.findById(event.getStoreId())
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        Alert alert = Alert.builder()
                .alertUuid(event.getAlertUuid())
                .store(store)
                .alertType(event.getAlertType())
                .description(event.getDescription())
                .detectedAt(event.getDetectedAt())
                .emailSent(false)
                .checked(false)
                .build();

        alertRepository.save(alert);
        log.info("테스트용 이상탐지 {}", alert);
    }
}
