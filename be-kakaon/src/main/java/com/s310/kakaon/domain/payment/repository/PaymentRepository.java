package com.s310.kakaon.domain.payment.repository;

import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.store.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Boolean existsByAuthorizationNo(String authorizationNo);
    List<Payment> findByStore(Store store);
}
