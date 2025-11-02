package com.s310.kakaon.domain.statistics.repository;

import com.s310.kakaon.domain.statistics.entity.PaymentStats;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentStatsRepository extends JpaRepository<PaymentStats, Long> {

}
