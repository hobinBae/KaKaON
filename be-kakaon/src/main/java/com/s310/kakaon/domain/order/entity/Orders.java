package com.s310.kakaon.domain.order.entity;

import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.global.entity.BaseEntity;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Orders extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    //    @Column(name = "store_id", nullable = false)
//    private Long storeId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "total_amount")
    private Integer totalAmount;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrderStatus status = OrderStatus.CREATED;

    @Column(name = "paid_amount", nullable = false)
    private Integer paidAmount;

    // 부분 환불 없지 않은감
    @Builder.Default
    @Column(name = "refunded_amount", nullable = false)
    private Integer refundedAmount = 0;

    @Builder.Default
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    public void addOrderItem(OrderItem orderItem){
        this.orderItems.add(orderItem);
        orderItem.setOrder(this);
    }

    // ====== Business Logic ======

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
}
