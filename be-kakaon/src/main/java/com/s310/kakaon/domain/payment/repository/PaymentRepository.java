package com.s310.kakaon.domain.payment.repository;

import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.store.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long>, PaymentRepositoryCustom {
    Boolean existsByAuthorizationNo(String authorizationNo);
    List<Payment> findByStore(Store store);
    Optional<Payment> findByOrder_OrderId(Long orderId);
    List<Payment> findByOrder_OrderIdIn(Collection<Long> orderIds);
}
