package com.s310.kakaon.domain.order.controller;

import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.domain.order.dto.*;
import com.s310.kakaon.domain.order.entity.OrderStatus;
import com.s310.kakaon.domain.order.service.OrderService;
import com.s310.kakaon.domain.payment.service.PaymentService;
import com.s310.kakaon.global.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.s310.kakaon.domain.payment.dto.PaymentMethod;

import java.time.OffsetDateTime;
import java.util.List;

@Tag(name = "Order", description = "주문 생성 / 조회 / 취소 관련 API")
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {
    //결제 내역 등록
    private final PaymentService paymentService;
    private final MemberService memberService;
    private final OrderService orderService;

    /** 장바구니 주문하기 */
    @Operation(
            summary = "주문 생성 (장바구니 주문)",
            description = """
                    사용자의 장바구니 데이터를 기반으로 새로운 주문을 생성하고, 
                    결제 정보를 함께 등록합니다.  
                    - PathVariable: storeId  
                    - RequestBody: 주문 메뉴 목록, 결제 방법, 주문 유형 등  
                    """
    )
    @PostMapping("/{storeId}")
    public ResponseEntity<ApiResponse<OrderResponseDto>> createOrder(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            @Valid @RequestBody OrderRequestDto request,
            HttpServletRequest httpRequest) {

        long start = System.currentTimeMillis();
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        OrderResponseDto response = orderService.createOrderAndPayment(memberId, storeId, request);
        long end = System.currentTimeMillis();
        log.info("[PERF] 주문 처리 총 소요 시간: {} ms", (end - start));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(HttpStatus.CREATED, "주문 성공", response, httpRequest.getRequestURI()));

    }

    /** 주문 상세 조회 */
    @Operation(
            summary = "주문 상세 조회",
            description = """
                    특정 주문(orderId)의 상세 정보를 조회합니다.  
                    주문 항목, 결제 정보, 가맹점 정보 등이 함께 반환됩니다.  
                    """
    )
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
    @Operation(
            summary = "주문 취소",
            description = """
                    결제가 완료된 주문을 취소합니다.  
                    - PathVariable: orderId  
                    - QueryParam: storeId  
                    - 취소 시 결제 금액이 환불 처리됩니다.  
                    """
    )
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
    @Operation(
            summary = "주문 목록 조회 (최근 7일)",
            description = """
                    특정 가맹점(storeId)의 주문 목록을 조회합니다.  
                    - Query Parameters:  
                      • today: 기준일  
                      • status: 주문 상태 (PAID, CANCELLED 등)  
                      • paymentMethod: 결제 수단  
                      • orderType: 주문 유형 (배달/매장 등)  
                    """
    )
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
