package com.s310.kakaon.domain.alert.mapper;

import com.s310.kakaon.domain.alert.dto.AlertEvent;
import com.s310.kakaon.domain.alert.dto.AlertResponseDto;
import com.s310.kakaon.domain.alert.entity.Alert;
import com.s310.kakaon.domain.store.entity.Store;
import org.springframework.stereotype.Component;

@Component
public class AlertMapper {

    public AlertResponseDto fromEntity(Alert alert){
        return AlertResponseDto.builder()
                .id(alert.getId())
                .alertUuid(alert.getAlertUuid())
                .detectedAt(alert.getDetectedAt())
                .alertType(alert.getAlertType())
                .checked(alert.getChecked())
                .build()
                ;
    }

    public Alert fromAlertEvent(AlertEvent alertEvent, Store store){
        return Alert.builder()
                .alertUuid(alertEvent.getAlertUuid())
                .store(store)
                .alertType(alertEvent.getAlertType())
                .description(alertEvent.getDescription())
                .detectedAt(alertEvent.getDetectedAt())
                .emailSent(false)
                .checked(false)
                .build();
    }

}
