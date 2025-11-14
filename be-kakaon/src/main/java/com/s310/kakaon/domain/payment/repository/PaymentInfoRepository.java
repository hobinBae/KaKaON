package com.s310.kakaon.domain.payment.repository;

import com.s310.kakaon.domain.payment.entity.PaymentInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentInfoRepository extends JpaRepository<PaymentInfo, Long> {
    Optional<PaymentInfo> findByPaymentUuid(String paymentUuid);
}