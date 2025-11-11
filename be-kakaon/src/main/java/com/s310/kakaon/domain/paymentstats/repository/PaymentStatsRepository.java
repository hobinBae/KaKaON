package com.s310.kakaon.domain.paymentstats.repository;

import com.s310.kakaon.domain.paymentstats.entity.PaymentStats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PaymentStatsRepository extends JpaRepository<PaymentStats, Long> {

    Optional<PaymentStats> findByStoreIdAndStatsDate(Long storeId, LocalDate statsDate);

    List<PaymentStats> findByStoreIdAndStatsDateBetween(Long storeId, LocalDate startDate, LocalDate endDate);

}
