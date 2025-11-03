package com.s310.kakaon.domain.order.dto;

import com.s310.kakaon.domain.order.entity.OrderStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderCancelResponseDto {
    private Long orderId;
    private String responseCode;
    private OrderStatus status;
    private Integer totalAmount;
    private Integer paidAmount;
    private Integer refundAmount;
    private String deletedAt;
}
