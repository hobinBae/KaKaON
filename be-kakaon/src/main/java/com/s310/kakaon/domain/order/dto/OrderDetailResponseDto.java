package com.s310.kakaon.domain.order.dto;

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
    private String status;
    private String orderType;
    private String paymentMethod;
    private Integer totalAmount;
    private Integer paidAmount;
    private Integer refundedAmount;
    private String createdAt;
    private String updatedAt;
    private String deletedAt;

    private List<OrderItemResponseDto> items;

}
