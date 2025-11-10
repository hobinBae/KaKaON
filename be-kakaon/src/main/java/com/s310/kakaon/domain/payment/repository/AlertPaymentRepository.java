package com.s310.kakaon.domain.payment.repository;

import com.s310.kakaon.domain.payment.entity.AlertPayment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AlertPaymentRepository extends JpaRepository<AlertPayment, Long> {

}
