package com.s310.kakaon.domain.alert.repository;


import com.s310.kakaon.domain.alert.entity.Alert;
import com.s310.kakaon.domain.store.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AlertRepository extends JpaRepository<Alert, Long>, AlertRepositoryCustom{

    Page<Alert> findByStore(Store store, Pageable pageable);

    boolean existsByAlertUuid(String alertUuid);

    List<Alert> findByStore(Store store);
}
