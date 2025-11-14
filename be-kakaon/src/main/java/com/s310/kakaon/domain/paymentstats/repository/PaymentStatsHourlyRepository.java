package com.s310.kakaon.domain.paymentstats.repository;

import com.s310.kakaon.domain.paymentstats.entity.PaymentStatsHourly;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentStatsHourlyRepository extends JpaRepository<PaymentStatsHourly, Long>, PaymentStatsHourlyRepositoryCustom {
    Optional<PaymentStatsHourly> findByPaymentStatsIdAndHour(Long statsId, Integer hour);
}
