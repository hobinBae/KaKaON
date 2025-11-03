package com.s310.kakaon.domain.order.dto;

import com.s310.kakaon.domain.order.entity.OrderStatus;
import com.s310.kakaon.domain.payment.dto.PaymentMethod;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDetailResponseDto {
    private Long orderId;
    private Long storeId;
    private String storeName;
    private OrderStatus status;
    private OrderType orderType;
    private PaymentMethod paymentMethod;
    private Integer totalAmount;
    private Integer paidAmount;
    private Integer refundedAmount;
    private String createdAt;
    private String updatedAt;
    private String deletedAt;

    private List<OrderItemDto> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemDto {
        private Long orderItemId;
        private Long menuId;
        private String menuName;
        private Integer price;
        private String imgUrl;
        private Integer quantity;
        private Integer totalPrice;
        private String createdAt;
        private String updatedAt;
        private String deletedAt;
    }
}
