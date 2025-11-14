package com.s310.kakaon.domain.paymentstats.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payment_stats_hourly",
        uniqueConstraints = {
        @UniqueConstraint(columnNames = {"payment_stats_id", "hour"})
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Getter
public class PaymentStatsHourly {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_stats_hourly_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_stats_id", nullable = false)
    private PaymentStats paymentStats;

    //통계날짜는 paymentStats에 있어서 안넣어도 될듯

    //0 ~ 23시
    @Column(name = "hour", nullable = false)
    private int hour;

    @Column(name = "hourly_total_sales", nullable = false)
    private Integer hourlyTotalSales;

    @Column(name = "hourly_payment_count", nullable = false)
    private Integer hourlyPaymentCount;

    @Column(name = "hourly_cancel_count", nullable = false)
    private Integer hourlyCancelCount;

    @Column(name = "hourly_cancel_rate", nullable = false)
    private Double hourlyCancelRate;


    public void applyPaymentHourly(int amount) {
        this.hourlyTotalSales += amount;
        this.hourlyPaymentCount += 1;
        recalcRate();
    }

    public void applyCancelHourly(int amount) {
        this.hourlyTotalSales -= amount;
        this.hourlyCancelCount += 1;
        recalcRate();
    }

    private void recalcRate() {
        if (this.hourlyPaymentCount == 0) {
            this.hourlyCancelRate = 0.0;
        } else {
            this.hourlyCancelRate = (this.hourlyCancelCount * 100.0) / this.hourlyPaymentCount;
        }
    }



}
