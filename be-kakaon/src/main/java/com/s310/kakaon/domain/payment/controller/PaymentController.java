package com.s310.kakaon.domain.payment.controller;


import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.domain.payment.dto.PaymentCreateRequestDto;
import com.s310.kakaon.domain.payment.dto.PaymentResponseDto;
import com.s310.kakaon.domain.payment.service.PaymentService;
import com.s310.kakaon.global.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    private final PaymentService paymentService;
    private final MemberService memberService;

    @DeleteMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<Void>> deletePayment(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long paymentId,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        paymentService.deletePayment(memberId, paymentId);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "결제 내역 제거 성공", null, httpRequest.getRequestURI()));
    }

    //검색 requestParam 받을 것들 오늘, 이번주, 이번달, 올해 + 기간 정보
    //결제 수단 : 전체, 카드, 계좌, 카카오페이, 현금
    //결제 상태 : 전체, 완료, 취소
    //주문 구분 : 전체, 배달 주문, 가게 주문
    //승인번호 검색
    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<List<PaymentResponseDto>>> getPaymentsByStore(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        List<PaymentResponseDto> response = paymentService.getPaymentsByStore(memberId, storeId);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "내 가맹점 결제내역 조회 성공", response, httpRequest.getRequestURI()));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> getPaymentById(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long paymentId,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        PaymentResponseDto response = paymentService.getPaymentById(memberId, paymentId);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "결제 내역 조회 성공", response, httpRequest.getRequestURI()));
    }
}
