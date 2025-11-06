package com.s310.kakaon.domain.order.controller;

import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.domain.order.dto.*;
import com.s310.kakaon.domain.order.entity.OrderStatus;
import com.s310.kakaon.domain.order.service.OrderService;
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
    private final OrderService orderService;

    /** 장바구니 주문하기 */
    @PostMapping("/{storeId}")
    public ResponseEntity<ApiResponse<OrderResponseDto>> createOrder(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            @Valid @RequestBody OrderRequestDto request,
            HttpServletRequest httpRequest) {

        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        OrderResponseDto response = orderService.createOrderAndPayment(memberId, storeId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(HttpStatus.CREATED, "주문 성공", response, httpRequest.getRequestURI()));

    }

    /** 주문 상세 조회 */
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderDetailResponseDto>> getOrderDetail(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable(name = "orderId") Long orderId,
            HttpServletRequest httpRequest) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        OrderDetailResponseDto response = orderService.getOrderDetail(memberId, orderId);
        return ResponseEntity.ok(ApiResponse.of(
                HttpStatus.OK,
                "주문 상세 조회를 성공적으로 완료했습니다.",
                response,
                httpRequest.getRequestURI()
        ));
    }

    /** 주문 취소 */
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderCancelResponseDto>> cancelOrder(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable(name = "orderId") Long orderId,
            @RequestParam(name = "storeId") Long storeId,
            HttpServletRequest httpRequest) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        OrderCancelResponseDto res = orderService.cancelOrder(memberId, storeId, orderId);

        return ResponseEntity.ok(ApiResponse.of(
                HttpStatus.OK,
                "주문 취소를 성공적으로 완료했습니다.",
                res,
                httpRequest.getRequestURI()
        ));
    }

    /** 주문 목록 조회 (최근 7일) */
    @GetMapping
    public ResponseEntity<ApiResponse<OrderListResponseDto>> getOrders(
            @AuthenticationPrincipal String kakaoId,
            @RequestParam(name = "storeId") Long storeId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "paymentMethod", required = false) String paymentMethod,
            @RequestParam(name = "orderType", required = false) String orderType,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        OrderListResponseDto response = orderService.getRecentOrderList(
                memberId,
                storeId,
                page,
                size,
                status,
                paymentMethod,
                orderType
        );

        return ResponseEntity.ok(ApiResponse.of(
                HttpStatus.OK,
                "주문 목록 조회가 성공적으로 완료 되었습니다.",
                response,
                httpRequest.getRequestURI()
        ));
    }
}
