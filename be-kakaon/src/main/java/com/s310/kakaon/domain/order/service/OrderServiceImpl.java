package com.s310.kakaon.domain.order.service;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.order.dto.OrderRequestDto;
import com.s310.kakaon.domain.order.dto.OrderRequestDto.OrderItemDto;
import com.s310.kakaon.domain.order.dto.OrderResponseDto;
import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.order.repository.OrderRepository;
import com.s310.kakaon.domain.payment.service.PaymentService;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService{

    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final StoreRepository storeRepository;
    private final PaymentService paymentService;

    @Override
    public OrderResponseDto OrderResponseDto(Long memberId, Long storeId, OrderRequestDto request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        int totalAmount = 0;
        for ( OrderItemDto dto: request.getItems()) {
            totalAmount += dto.getPrice() * dto.getQuantity();
        }
        Orders order = Orders.builder()
                .store(store)
                .totalAmount(totalAmount)
                .


        return null;
    }
}
