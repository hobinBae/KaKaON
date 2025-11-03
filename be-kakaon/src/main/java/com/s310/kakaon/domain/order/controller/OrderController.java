package com.s310.kakaon.domain.order.controller;

import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.domain.order.dto.*;
import com.s310.kakaon.domain.order.entity.OrderStatus;
import com.s310.kakaon.domain.payment.dto.PaymentCreateRequestDto;
import com.s310.kakaon.domain.payment.service.PaymentService;
import com.s310.kakaon.global.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.s310.kakaon.domain.payment.dto.PaymentMethod;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {
    //결제 내역 등록
    private final PaymentService paymentService;
    private final MemberService memberService;

    /** 장바구니 주문하기 */
    @PostMapping("/{storeId}")
    public ResponseEntity<ApiResponse<OrderResponseDto>> createOrder(
            @AuthenticationPrincipal String kakaoId,
            @RequestBody Long storeId,
            @Valid @RequestBody OrderRequestDto request,
            HttpServletRequest httpRequest) {

        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
//        // Dummy Data 생성
//        OrderResponseDto dummy = OrderResponseDto.builder()
//                .orderId(1001L)
//                .storeId(storeId)
//                .totalAmount(req.getTotalAmount())
//                .orderType(req.getOrderType())
//                .paymentMethod(req.getPaymentMethod())
//                .status(OrderStatus.CREATED)
//                .createdAt(OffsetDateTime.now().toString())
//                .build();
//
//        //여기는 내일 수정해야할 거 같다.
//        //결제는 오더가 되고 해야하기 때문에 오더에 옮김
//        PaymentCreateRequestDto pay = PaymentCreateRequestDto.builder()
//                .amount(dummy.getTotalAmount())
//                .paymentMethod(dummy.getPaymentMethod())
//                .delivery()
////        paymentService.registerPayment(memberId, storeId, dummy.getOrderId(), );
//
//        return ResponseEntity.status(HttpStatus.CREATED)
//                .body(ApiResponse.of(
//                        HttpStatus.CREATED,
//                        "주문 생성을 성공적으로 완료했습니다.",
//                        dummy,
//                        httpRequest.getRequestURI()
//                ));
    }

    /** 주문 상세 조회 */
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderDetailResponseDto>> getOrderDetail(
            @PathVariable(name = "orderId") Long orderId,
            HttpServletRequest httpRequest) {

        // Dummy Data 생성
        List<OrderDetailResponseDto.OrderItemDto> items = List.of(
                OrderDetailResponseDto.OrderItemDto.builder()
                        .orderItemId(10101L)
                        .menuId(501L)
                        .menuName("아메리카노")
                        .price(3000)
                        .imgUrl("https://cdn.example.com/menu/ame.jpg")
                        .quantity(2)
                        .totalPrice(6000)
                        .createdAt("2025-10-20T03:00:00+09:00")
                        .updatedAt("2025-10-20T03:02:00+09:00")
                        .deletedAt(null)
                        .build(),
                OrderDetailResponseDto.OrderItemDto.builder()
                        .orderItemId(10102L)
                        .menuId(502L)
                        .menuName("라떼")
                        .price(4000)
                        .imgUrl("https://cdn.example.com/menu/latte.jpg")
                        .quantity(1)
                        .totalPrice(4000)
                        .createdAt("2025-10-20T03:00:00+09:00")
                        .updatedAt("2025-10-20T03:02:00+09:00")
                        .deletedAt(null)
                        .build()
        );

        OrderDetailResponseDto dummy = OrderDetailResponseDto.builder()
                .orderId(orderId)
                .storeId(11L)
                .storeName("강남점")
                .status(OrderStatus.PAID)
                .orderType(OrderType.STORE)
                .paymentMethod(PaymentMethod.CARD)
                .totalAmount(10000)
                .paidAmount(10000)
                .refundedAmount(0)
                .createdAt("2025-10-20T03:00:00+09:00")
                .updatedAt("2025-10-20T03:02:00+09:00")
                .deletedAt(null)
                .items(items)
                .build();

        return ResponseEntity.ok(ApiResponse.of(
                HttpStatus.OK,
                "주문 상세 조회를 성공적으로 완료했습니다.",
                dummy,
                httpRequest.getRequestURI()
        ));
    }

    /** 주문 취소 */
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderCancelResponseDto>> cancelOrder(
            @PathVariable(name = "orderId") Long orderId,
            @RequestParam(name = "storeId") Long storeId,
            HttpServletRequest httpRequest) {

        // Dummy data 생성
        OrderCancelResponseDto dummy = OrderCancelResponseDto.builder()
                .orderId(orderId)
                .responseCode("C0000000001")
                .status(OrderStatus.CANCELED)
                .totalAmount(10500)
                .paidAmount(0)
                .refundAmount(10500)
                .deletedAt("2025-10-20T03:05:00+09:00")
                .build();

        return ResponseEntity.ok(ApiResponse.of(
                HttpStatus.OK,
                "주문 취소를 성공적으로 완료했습니다.",
                dummy,
                httpRequest.getRequestURI()
        ));
    }

    /** 주문 목록 조회 (최근 7일) */
    @GetMapping
    public ResponseEntity<ApiResponse<OrderListResponseDto>> getOrders(
            @RequestParam(name = "storeId") Long storeId,
            @RequestParam(name = "today") String today,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "status", required = false) OrderStatus status,
            @RequestParam(name = "paymentMethod", required = false) PaymentMethod paymentMethod,
            @RequestParam(name = "orderType", required = false) OrderType orderType,
            HttpServletRequest httpRequest
    ) {

        // Dummy data 생성
        List<OrderListResponseDto.OrderItem> itemList = List.of(
                OrderListResponseDto.OrderItem.builder()
                        .orderItemId(1L)
                        .menuId(501L)
                        .menuName("아메리카노")
                        .price(3000)
                        .imgUrl("https://cdn.example.com/menu/ame.jpg")
                        .quantity(2)
                        .totalPrice(6000)
                        .createdAt("2025-10-20T03:00:00+09:00")
                        .updatedAt("2025-10-20T03:02:00+09:00")
                        .deletedAt(null)
                        .build(),
                OrderListResponseDto.OrderItem.builder()
                        .orderItemId(2L)
                        .menuId(502L)
                        .menuName("카페라떼")
                        .price(4500)
                        .imgUrl("https://cdn.example.com/menu/latte.jpg")
                        .quantity(1)
                        .totalPrice(4500)
                        .createdAt("2025-10-20T03:00:00+09:00")
                        .updatedAt("2025-10-20T03:02:00+09:00")
                        .deletedAt(null)
                        .build()
        );

        List<OrderListResponseDto.OrderSummary> orderList = List.of(
                OrderListResponseDto.OrderSummary.builder()
                        .orderId(9001L)
                        .storeId(storeId)
                        .storeName("강남점")
                        .status(OrderStatus.PAID)
                        .orderType(OrderType.STORE)
                        .paymentMethod(PaymentMethod.CARD)
                        .totalAmount(10500)
                        .paidAmount(10500)
                        .refundedAmount(0)
                        .createdAt("2025-10-20T03:00:00+09:00")
                        .updatedAt("2025-10-20T03:02:00+09:00")
                        .deletedAt(null)
                        .itemsCount(3)
                        .items(itemList)
                        .build(),
                OrderListResponseDto.OrderSummary.builder()
                        .orderId(9002L)
                        .storeId(storeId)
                        .storeName("강남점")
                        .status(OrderStatus.PAID)
                        .orderType(OrderType.DELIVERY)
                        .paymentMethod(PaymentMethod.KAKAOPAY)
                        .totalAmount(9800)
                        .paidAmount(9800)
                        .refundedAmount(0)
                        .createdAt("2025-10-21T04:00:00+09:00")
                        .updatedAt("2025-10-21T04:05:00+09:00")
                        .deletedAt(null)
                        .itemsCount(2)
                        .items(itemList)
                        .build()
        );

        OrderListResponseDto response = OrderListResponseDto.builder()
                .content(orderList)
                .page(page)
                .size(size)
                .totalElements(124)
                .totalPages(7)
                .build();

        return ResponseEntity.ok(ApiResponse.of(
                HttpStatus.OK,
                "주문 목록 조회가 성공적으로 완료 되었습니다.",
                response,
                httpRequest.getRequestURI()
        ));
    }
}
