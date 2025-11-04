package com.s310.kakaon.domain.order.mapper;

import com.s310.kakaon.domain.menu.entity.Menu;
import com.s310.kakaon.domain.menu.repository.MenuRepository;
import com.s310.kakaon.domain.order.dto.OrderRequestDto;
import com.s310.kakaon.domain.order.dto.OrderResponseDto;
import com.s310.kakaon.domain.order.dto.OrderType;
import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.payment.dto.PaymentMethod;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final MenuRepository menuRepository;

    public OrderResponseDto toResponseDto(Orders order, OrderType orderType, PaymentMethod paymentMethod){
        return OrderResponseDto.builder()
                .orderId(order.getOrderId())
                .storeId(order.getStore().getId())
                .totalAmount(order.getTotalAmount())
                .orderType(orderType)
                .paymentMethod(paymentMethod)
                .status(order.getStatus())
                .createdAt(order.getCreatedDateTime())
                .build();
    }

    public Orders fromEntity(Store store, OrderRequestDto request){
       Orders order =  Orders.builder()
                .store(store)
                .totalAmount(request.getTotalAmount())
                .paidAmount(request.getTotalAmount())
                .build();

        for ( OrderRequestDto.OrderItemCreateRequestDto dto: request.getItems()) {
            Menu menu = menuRepository.findById(dto.getMenuId())
                    .orElseThrow(() -> new ApiException(ErrorCode.MENU_NOT_FOUND));
            order.addOrderItem(menu, dto.getPrice(), dto.getQuantity());
        }

        return order;
    }
}
