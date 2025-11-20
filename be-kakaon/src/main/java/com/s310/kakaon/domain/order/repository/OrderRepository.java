package com.s310.kakaon.domain.order.repository;

import com.s310.kakaon.domain.order.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import com.s310.kakaon.domain.analytics.dto.MenuSummaryDto;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Orders, Long>, JpaSpecificationExecutor<Orders>{
    @Query("""
    select o
    from Orders o
      join fetch o.store s
      left join fetch o.orderItems oi
      left join fetch oi.menu m
    where o.orderId = :orderId
    """)
    Optional<Orders> findByIdWithStoreItemsAndMenu(@Param("orderId") Long orderId);

    @Query("""
    SELECT new com.s310.kakaon.domain.analytics.dto.MenuSummaryDto(
        oi.menu.name,
        SUM(oi.quantity),
        SUM(oi.totalPrice))
    FROM OrderItem oi
    JOIN oi.order o
    WHERE o.store.id = :storeId
      AND o.createdDateTime BETWEEN :startDate AND :endDate
      AND o.status = com.s310.kakaon.domain.order.entity.OrderStatus.PAID
    GROUP BY oi.menu.name
    ORDER BY SUM(oi.totalPrice) DESC
    """)
    List<MenuSummaryDto> findMenuSummaryByPeriod(
            @Param("storeId") Long storeId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
