package com.s310.kakaon.domain.order.repository;

import com.s310.kakaon.domain.order.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

}
