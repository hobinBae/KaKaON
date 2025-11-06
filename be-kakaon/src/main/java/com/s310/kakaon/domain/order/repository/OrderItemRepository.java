package com.s310.kakaon.domain.order.repository;

import com.s310.kakaon.domain.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long>{
    List<OrderItem> findByOrder_OrderIdIn(List<Long> orderIds);
}
