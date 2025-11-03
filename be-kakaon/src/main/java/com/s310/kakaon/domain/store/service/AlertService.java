package com.s310.kakaon.domain.store.service;

import com.s310.kakaon.domain.store.dto.AlertRecipientCreateRequestDto;
import com.s310.kakaon.domain.store.dto.AlertRecipientResponseDto;
import com.s310.kakaon.domain.store.dto.AlertRecipientUpdateRequestDto;

public interface AlertService {
    AlertRecipientResponseDto registerAlert(Long storeId, Long memberId, AlertRecipientCreateRequestDto request);

    void deleteAlert(Long storeId, Long memberId, Long id);

    AlertRecipientResponseDto updateAlert(Long storeId, Long memberId, Long id,  AlertRecipientUpdateRequestDto request);

}
