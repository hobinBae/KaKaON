package com.s310.kakaon.domain.store.mapper;

import com.s310.kakaon.domain.store.dto.AlertRecipientCreateRequestDto;
import com.s310.kakaon.domain.store.dto.AlertRecipientResponseDto;
import com.s310.kakaon.domain.store.entity.AlertRecipient;
import com.s310.kakaon.domain.store.entity.Store;
import org.springframework.stereotype.Component;

@Component
public class AlertRecipientMapper {

    public AlertRecipientResponseDto fromEntity(AlertRecipient alert){
        return AlertRecipientResponseDto.builder()
                .id(alert.getId())
                .name(alert.getName())
                .position(alert.getPosition())
                .email(alert.getEmail())
                .active(alert.getActive())
                .build();
    }

    public AlertRecipient toEntity(AlertRecipientCreateRequestDto request, Store store){
        return AlertRecipient.builder()
                .name(request.getName())
                .position(request.getPosition())
                .store(store)
                .email(request.getEmail())
                .build();
    }
}
