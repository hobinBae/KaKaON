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
public class OrderListResponseDto {
    private List<OrderSummary> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderSummary {
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
        private int itemsCount;
        private List<OrderItemResponseDto> items;
    }

}
