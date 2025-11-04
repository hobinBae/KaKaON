package com.s310.kakaon.domain.order.service;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.menu.entity.Menu;
import com.s310.kakaon.domain.menu.repository.MenuRepository;
import com.s310.kakaon.domain.order.dto.OrderRequestDto;
import com.s310.kakaon.domain.order.dto.OrderResponseDto;
import com.s310.kakaon.domain.order.dto.OrderType;
import com.s310.kakaon.domain.order.entity.OrderItem;
import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.order.mapper.OrderMapper;
import com.s310.kakaon.domain.order.repository.OrderRepository;
import com.s310.kakaon.domain.payment.dto.PaymentCreateRequestDto;
import com.s310.kakaon.domain.payment.service.PaymentService;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService{

    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final StoreRepository storeRepository;
    private final MenuRepository menuRepository;
    private final PaymentService paymentService;
    private final OrderMapper orderMapper;

    @Override
    @Transactional
    public OrderResponseDto createOrderAndPayment(Long memberId, Long storeId, OrderRequestDto request) {
        Orders order = createOrder(memberId, storeId, request);

        PaymentCreateRequestDto payRequest = PaymentCreateRequestDto.builder()
                .amount(request.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .delivery(request.getOrderType() == OrderType.DELIVERY)
                .build();

        paymentService.registerPayment(memberId, storeId, order.getOrderId(), payRequest);

        return orderMapper.fromEntity(order, request.getOrderType(), request.getPaymentMethod());
    }

    @Override
    @Transactional
    public Orders createOrder(Long memberId, Long storeId, OrderRequestDto request) {
        memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        Orders order = orderMapper.toEntity(store, request);

        orderRepository.save(order);

        return order;
    }
}
