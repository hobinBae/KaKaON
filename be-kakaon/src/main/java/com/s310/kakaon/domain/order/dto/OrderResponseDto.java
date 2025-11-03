package com.s310.kakaon.domain.order.dto;

import com.s310.kakaon.domain.order.entity.OrderStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDto {
    private Long orderId;
    private Long storeId;
    private Integer totalAmount;
    private OrderType orderType;
    private PaymentMethod paymentMethod;
    private OrderStatus status;
    private String createdAt;
}
