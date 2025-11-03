package com.s310.kakaon.domain.order.service;

import com.s310.kakaon.domain.order.dto.OrderRequestDto;
import com.s310.kakaon.domain.order.dto.OrderResponseDto;

public interface OrderService {
    OrderResponseDto createOrder(Long memberId, Long storeId, OrderRequestDto request);
}
