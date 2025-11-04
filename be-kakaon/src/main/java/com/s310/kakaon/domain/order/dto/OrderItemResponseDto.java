package com.s310.kakaon.domain.order.dto;

import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponseDto {
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
