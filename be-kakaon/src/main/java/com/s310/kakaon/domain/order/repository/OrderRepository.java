package com.s310.kakaon.domain.order.repository;

import com.s310.kakaon.domain.order.entity.Orders;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Orders, Long> {

}
