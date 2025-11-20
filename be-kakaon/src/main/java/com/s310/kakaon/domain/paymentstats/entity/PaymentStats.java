package com.s310.kakaon.domain.paymentstats.entity;

import com.s310.kakaon.domain.payment.dto.PaymentMethod;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.global.entity.BaseEntity;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payment_stats",
        uniqueConstraints = {
            @UniqueConstraint(columnNames = {"store_id", "start_date"})
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@Builder
public class PaymentStats extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_stats_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    //통계 날짜는 생성 날짜를 그냥 써도 상관없지 않을까용 -> 상관있음 영업종료시간이 다음날짜면??
    @Column(name = "start_date", nullable = false)
    private LocalDate statsDate;

    @Column(name = "total_sales", nullable = false)
    private Integer totalSales;

    @Column(name = "total_cancel_sales", nullable = false)
    private Integer totalCancelSales;

    @Builder.Default
    @Column(name = "sales_cnt", nullable = false)
    private Long salesCnt = 0L;

    @Builder.Default
    @Column(name = "cancel_cnt", nullable = false)
    private Long cancelCnt = 0L;

    @Builder.Default
    @Column(name = "card_sales", nullable = false)
    private Integer cardSales = 0;

    @Builder.Default
    @Column(name = "kakao_sales", nullable = false)
    private Integer kakaoSales = 0;

    @Builder.Default
    @Column(name = "cash_sales", nullable = false)
    private Integer cashSales = 0;

    @Builder.Default
    @Column(name = "transfer_sales", nullable = false)
    private Integer transferSales = 0;

    @Builder.Default
    @Column(name = "delivery_sales", nullable = false)
    private Integer deliverySales = 0;

    public void applyPayment(Integer amount, PaymentMethod method, Boolean delivery) {
        this.totalSales += amount;
        this.salesCnt += 1;

        switch (method) {
            case CARD -> this.cardSales += amount;
            case KAKAOPAY -> this.kakaoSales += amount;
            case CASH -> this.cashSales += amount;
            case TRANSFER -> this.transferSales += amount;
        }

        if (delivery) {
            this.deliverySales += amount;
        }
    }

    public void applyCancel(Integer amount, PaymentMethod method, Boolean delivery) {
        this.totalCancelSales += amount;
        this.cancelCnt += 1;
        this.totalSales -= amount;

        switch (method) {
            case CARD -> this.cardSales -= amount;
            case KAKAOPAY -> this.kakaoSales -= amount;
            case CASH -> this.cashSales -= amount;
            case TRANSFER -> this.transferSales -= amount;
        }

        if (delivery) {
            this.deliverySales -= amount;
        }
    }

    /**
     * Redis에서 가져온 데이터로 통계 업데이트
     */
    public void updateFromRedis(Integer totalSales, Integer totalCancelSales, Long salesCnt, Long cancelCnt,
                                Integer cardSales, Integer kakaoSales, Integer cashSales, Integer transferSales,
                                Integer deliverySales) {
        this.totalSales = totalSales;
        this.totalCancelSales = totalCancelSales;
        this.salesCnt = salesCnt;
        this.cancelCnt = cancelCnt;
        this.cardSales = cardSales;
        this.kakaoSales = kakaoSales;
        this.cashSales = cashSales;
        this.transferSales = transferSales;
        this.deliverySales = deliverySales;
    }
}
