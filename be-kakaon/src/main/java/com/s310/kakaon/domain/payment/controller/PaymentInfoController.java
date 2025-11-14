package com.s310.kakaon.domain.payment.controller;

import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.domain.payment.dto.PaymentInfoRequestDto;
import com.s310.kakaon.domain.payment.dto.PaymentInfoResponseDto;
import com.s310.kakaon.domain.payment.service.PaymentInfoService;
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


@Tag(name = "PaymentInfo", description = "결제 수단(카드 번호/카카오페이 바코드 번호) 관련 API")
@RestController
@RequestMapping("/api/v1/payment-info")
@RequiredArgsConstructor
@Slf4j
public class PaymentInfoController {

    private final PaymentInfoService paymentInfoService;
    private final MemberService memberService;

    @Operation(
            summary = "결제 수단 등록",
            description = "새로운 결제 수단(카드번호, 카카오페이 바코드 등)을 등록합니다."
    )
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentInfoResponseDto>> registerPaymentInfo(
            @AuthenticationPrincipal String kakaoId,
            @Valid @RequestBody PaymentInfoRequestDto request,
            HttpServletRequest httpRequest) {

        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        PaymentInfoResponseDto response = paymentInfoService.registerPaymentInfo(memberId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(HttpStatus.CREATED, "결제 수단 등록 성공", response, httpRequest.getRequestURI()));
    }
}
