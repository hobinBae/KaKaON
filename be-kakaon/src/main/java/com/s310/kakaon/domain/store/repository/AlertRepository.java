package com.s310.kakaon.domain.store.repository;

import com.s310.kakaon.domain.store.entity.AlertRecipient;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<AlertRecipient, Long> {
}
