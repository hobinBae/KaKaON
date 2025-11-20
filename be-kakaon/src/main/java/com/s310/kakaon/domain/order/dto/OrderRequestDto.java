package com.s310.kakaon.domain.order.dto;

import com.s310.kakaon.domain.payment.dto.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequestDto {
    @NotNull(message = "주문 항목은 필수입니다.")
    @Size(min = 1, message = "최소 1개 이상의 메뉴를 포함해야 합니다.")
    @Valid
    private List<OrderItemCreateRequestDto> items;

    @NotNull(message = "총 결제 금액은 필수입니다.")
    @Positive(message = "총 결제 금액은 0보다 커야 합니다.")
    private Integer totalAmount;

    @NotNull(message = "주문 유형은 필수입니다.")
    private OrderType  orderType;

    @NotNull(message = "결제 수단은 필수입니다.")
    private PaymentMethod paymentMethod;

    private String paymentUuid;

    // 내부 OrderItemDto 클래스
    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItemCreateRequestDto {
        @NotNull(message = "메뉴 ID는 필수입니다.")
        private Long menuId;

        @NotNull(message = "단가는 필수입니다.")
        @PositiveOrZero(message = "단가는 0 이상이어야 합니다.")
        private Integer price;

        @NotNull(message = "수량은 필수입니다.")
        @Min(value = 1, message = "수량은 최소 1 이상이어야 합니다.")
        private Integer quantity;
    }
}
