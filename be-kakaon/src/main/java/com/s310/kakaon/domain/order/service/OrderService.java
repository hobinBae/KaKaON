package com.s310.kakaon.domain.order.service;

import com.s310.kakaon.domain.order.dto.*;
import com.s310.kakaon.domain.order.entity.Orders;

public interface OrderService {
    OrderResponseDto createOrderAndPayment(Long memberId, Long storeId, OrderRequestDto request);
    Orders createOrder(Long memberId, Long storeId, OrderRequestDto request);
    OrderCancelResponseDto cancelOrder(Long memberId, Long storeId, Long orderId);
    OrderDetailResponseDto getOrderDetail(Long memberId, Long orderId);
    OrderListResponseDto getRecentOrderList(
        Long memberId,
        Long storeId,
        Integer page,
        Integer size,
        String status,
        String paymentMethod,
        String orderType
    );
}
