package com.s310.kakaon.domain.alert.repository;


import com.s310.kakaon.domain.alert.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertRepository extends JpaRepository<Alert, Long> {

}
