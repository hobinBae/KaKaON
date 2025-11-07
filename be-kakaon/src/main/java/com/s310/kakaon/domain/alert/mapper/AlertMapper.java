package com.s310.kakaon.domain.alert.mapper;

import com.s310.kakaon.domain.alert.dto.AlertResponseDto;
import com.s310.kakaon.domain.alert.entity.Alert;
import com.s310.kakaon.domain.store.entity.Store;
import org.springframework.stereotype.Component;

@Component
public class AlertMapper {

    public AlertResponseDto fromEntity(Alert alert){
        return AlertResponseDto.builder()
                .alertUuid(alert.getAlertUuid())
                .detectedAt(alert.getDetectedAt())
                .alertType(alert.getAlertType())
                .checked(alert.getChecked())
                .build()
                ;
    }
}
