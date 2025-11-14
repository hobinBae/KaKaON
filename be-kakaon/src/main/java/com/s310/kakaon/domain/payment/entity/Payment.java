package com.s310.kakaon.domain.payment.entity;

import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.payment.dto.PaymentMethod;
import com.s310.kakaon.domain.payment.dto.PaymentStatus;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Getter
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = true)
    private Orders order;

    @Column(name = "authorization_no", nullable = false, length = 20, unique = true)
    private String authorizationNo;

    @Column(name = "amount", nullable = false)
    private Integer amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status;

    @Column(name = "approved_at", nullable = false)
    private LocalDateTime approvedAt;

    @Column(name = "canceled_at")
    private LocalDateTime canceledAt;

    @Builder.Default
    @Column(name = "is_delivery", nullable = false, columnDefinition = "TINYINT(1)")
    private Boolean delivery = false;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "payment_info_id", nullable = false)
    private PaymentInfo paymentInfo;

    public void cancel(){
        this.canceledAt = LocalDateTime.now();
        this.status = PaymentStatus.CANCELED;
    }

}
