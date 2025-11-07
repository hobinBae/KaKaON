package com.s310.kakaon.domain.alert.repository;

import com.s310.kakaon.domain.alert.dto.AlertSearchRequestDto;
import com.s310.kakaon.domain.alert.entity.Alert;
import com.s310.kakaon.domain.store.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AlertRepositoryCustom {

    Page<Alert> searchAlerts(Store store, AlertSearchRequestDto request, Pageable pageable);


}
