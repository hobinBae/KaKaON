package com.s310.kakaon.domain.paymentstats.repository;

import com.s310.kakaon.domain.paymentstats.entity.PaymentStats;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentStatsRepository extends JpaRepository<PaymentStats, Long> {

}
