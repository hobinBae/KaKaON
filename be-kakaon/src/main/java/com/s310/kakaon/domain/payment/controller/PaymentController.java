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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    private final PaymentService paymentService;
    private final MemberService memberService;

    @PostMapping("/orders/{orderId}")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> registerPayment(
            @AuthenticationPrincipal String kakaoId,
            @RequestBody PaymentCreateRequestDto request,
            @PathVariable Long orderId,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        PaymentResponseDto response = paymentService.registerPayment(memberId, orderId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(HttpStatus.CREATED, "결제 등록 성공", response, httpRequest.getRequestURI()));
    }




}
