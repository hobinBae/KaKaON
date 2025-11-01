package com.s310.kakaon.domain.statistics.entity;

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
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payment_stats")
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

    //통계 날짜는 생성 날짜를 그냥 써도 상관없지 않을까용
//    @Column(name = "total_sales", nullable = false)
//    private LocalDateTime statsDate;

    @Column(name = "total_sales", precision = 14, scale = 2, nullable = false)
    private BigDecimal totalSales;

    @Column(name = "total_cancels", precision = 14, scale = 2, nullable = false)
    private BigDecimal totalCancels;

    @Builder.Default
    @Column(name = "sales_cnt", nullable = false)
    private Long salesCnt = 0L;

    @Builder.Default
    @Column(name = "cancels_cnt", nullable = false)
    private Long cancelsCnt = 0L;

    @Builder.Default
    @Column(name = "card_sales" , precision =  14, scale = 2, nullable = false)
    private BigDecimal cardSales = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "kakao_sales" , precision =  14, scale = 2, nullable = false)
    private BigDecimal kakaoSales = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "cash_sales" , precision =  14, scale = 2, nullable = false)
    private BigDecimal cashSales = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "transfer_sales" , precision =  14, scale = 2, nullable = false)
    private BigDecimal transferSales = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "delivery_sales", precision =  14, scale = 2, nullable = false)
    private BigDecimal deliverySales = BigDecimal.ZERO;
}
