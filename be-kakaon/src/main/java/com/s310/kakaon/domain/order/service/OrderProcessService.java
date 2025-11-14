package com.s310.kakaon.domain.order.service;

import com.s310.kakaon.domain.order.dto.OrderRequestDto;
import com.s310.kakaon.domain.order.dto.OrderResponseDto;
import com.s310.kakaon.domain.order.dto.OrderType;
import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.order.mapper.OrderMapper;
import com.s310.kakaon.domain.payment.dto.PaymentCreateRequestDto;
import com.s310.kakaon.domain.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderProcessService {

    private final OrderService orderService;
    private final PaymentService paymentService;
    private final OrderMapper orderMapper;

    @Transactional
    public OrderResponseDto createOrderAndPayment(Long memberId, Long storeId, OrderRequestDto request){
        Orders order = orderService.createOrder(memberId, storeId, request);

        PaymentCreateRequestDto payRequest = PaymentCreateRequestDto.builder()
                .amount(request.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .delivery(request.getOrderType() == OrderType.DELIVERY)
                .paymentUuid(request.getPaymentUuid())
                .build();

        paymentService.registerPayment(memberId, storeId, order.getOrderId(), payRequest);
        order.updateStatus(request.getTotalAmount());

        return orderMapper.fromEntity(order, request.getOrderType(), request.getPaymentMethod());
    }

}
