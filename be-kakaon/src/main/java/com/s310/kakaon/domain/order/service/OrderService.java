package com.s310.kakaon.domain.order.service;

import com.s310.kakaon.domain.order.dto.OrderCancelResponseDto;
import com.s310.kakaon.domain.order.dto.OrderRequestDto;
import com.s310.kakaon.domain.order.dto.OrderResponseDto;
import com.s310.kakaon.domain.order.entity.Orders;

public interface OrderService {
    OrderResponseDto createOrderAndPayment(Long memberId, Long storeId, OrderRequestDto request);
    Orders createOrder(Long memberId, Long storeId, OrderRequestDto request);
    OrderCancelResponseDto cancelOrder(Long memberId, Long storeId, Long orderId);
}
