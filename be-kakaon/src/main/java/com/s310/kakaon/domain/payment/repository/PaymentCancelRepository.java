package com.s310.kakaon.domain.payment.repository;

import com.s310.kakaon.domain.payment.entity.PaymentCancel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentCancelRepository extends JpaRepository<PaymentCancel, Long> {
    Optional<PaymentCancel> findByPaymentId(Long paymentId);

}
