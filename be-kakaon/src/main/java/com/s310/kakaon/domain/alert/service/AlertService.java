package com.s310.kakaon.domain.alert.service;

import com.s310.kakaon.domain.alert.dto.*;
import com.s310.kakaon.domain.alert.entity.Alert;
import com.s310.kakaon.global.dto.PageResponse;
import org.springframework.data.domain.Pageable;

public interface AlertService {

//    public void createAndSendAlert(AlertEvent event);
    Alert createAlert(AlertEvent event);
    PageResponse<AlertResponseDto> getAnomalyAlerts(Long storeId, Long memberId, AlertSearchRequestDto request, Pageable pageable);

    AlertDetailResponseDto getAnomalyAlert(Long memberId, Long storeId, Long id);

    PageResponse<AlertResponseDto> checkedAnomalyAlerts(Long storeId, Long memberId, Pageable pageable);

    AlertResponseDto checkedAnomalyAlert(Long memberId, Long storeId, Long id);

    AlertUnreadCountResponseDto getUnreadAlertCount(Long memberId, Long storeId);
}
