package com.s310.kakaon.domain.alert.service;

import com.s310.kakaon.domain.alert.dto.AlertEvent;

public interface AlertService {
    public void createAndSendAlert(AlertEvent event);
}
