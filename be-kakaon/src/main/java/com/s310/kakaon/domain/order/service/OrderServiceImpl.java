package com.s310.kakaon.domain.order.service;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.menu.entity.Menu;
import com.s310.kakaon.domain.menu.repository.MenuRepository;
import com.s310.kakaon.domain.order.dto.OrderRequestDto;
import com.s310.kakaon.domain.order.dto.OrderRequestDto.OrderItemDto;
import com.s310.kakaon.domain.order.dto.OrderResponseDto;
import com.s310.kakaon.domain.order.entity.OrderItem;
import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.order.repository.OrderRepository;
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

    @Override
    @Transactional
    public OrderResponseDto createOrder(Long memberId, Long storeId, OrderRequestDto request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));


        Orders order = Orders.builder()
                .store(store)
                .totalAmount(request.getTotalAmount())
                .paidAmount(request.getTotalAmount())
                .build();


        for ( OrderItemDto dto: request.getItems()) {
            Menu menu = menuRepository.findById(dto.getMenuId())
                    .orElseThrow(() -> new ApiException(ErrorCode.MENU_NOT_FOUND));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .menu(menu)
                    .quantity(dto.getQuantity())
                    .totalPrice(dto.getPrice() * dto.getQuantity())
                    .build();
            order.addOrderItem(orderItem);
        }

        orderRepository.save(order);

        

        paymentService.registerPayment(memberId, storeId, order.getOrderId(), )



        return null;
    }
}
