package com.s310.kakaon.domain.payment.controller;


import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.domain.payment.dto.PaymentCreateRequestDto;
import com.s310.kakaon.domain.payment.dto.PaymentResponseDto;
import com.s310.kakaon.domain.payment.dto.PaymentSearchRequestDto;
import com.s310.kakaon.domain.payment.service.PaymentService;
import com.s310.kakaon.global.dto.ApiResponse;
import com.s310.kakaon.global.dto.PageResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    private final PaymentService paymentService;
    private final MemberService memberService;

    @DeleteMapping("/{paymentId}")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> deletePayment(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long paymentId,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        PaymentResponseDto response = paymentService.deletePayment(memberId, paymentId);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "결제 내역 제거 성공", response, httpRequest.getRequestURI()));
    }

    //검색 requestParam 받을 것들 오늘, 이번주, 이번달, 올해 + 기간 정보
    //결제 수단 : 전체, 카드, 계좌, 카카오페이, 현금
    //결제 상태 : 전체, 완료, 취소
    //주문 구분 : 전체, 배달 주문, 가게 주문
    //승인번호 검색
    @GetMapping("/stores/{storeId}")
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponseDto>>> getPaymentsByStore(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            @ModelAttribute PaymentSearchRequestDto request,
            Pageable pageable,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        PageResponse<PaymentResponseDto> response = paymentService.getPaymentsByStore(memberId, storeId, request, pageable);

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

    @GetMapping("/stores/{storeId}/export")
    public ResponseEntity<byte[]> downloadPaymentsCsv(
            @AuthenticationPrincipal String kakaoId,
            @ModelAttribute PaymentSearchRequestDto request,
            @PathVariable Long storeId
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        byte[] csvData = paymentService.downloadPaymentsCsv(memberId, storeId, request);

        // 파일명 생성 (현재 시간 포함)
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = "payments_" + timestamp + ".csv";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(csvData.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvData);
    }

    @PostMapping("/stores/{storeId}/upload")
    public ResponseEntity<ApiResponse<String>> uploadPaymentsCsv(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        // 파일 검증
        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.of(HttpStatus.BAD_REQUEST, "파일이 비어있습니다.", null, httpRequest.getRequestURI()));
        }

        // 파일 형식 검증
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.of(HttpStatus.BAD_REQUEST, "CSV 파일만 업로드 가능합니다.", null, httpRequest.getRequestURI()));
        }

        paymentService.uploadPaymentsFromCsv(file, storeId, memberId);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "결제 내역 CSV 업로드 성공", "CSV 파일 업로드가 완료되었습니다.", httpRequest.getRequestURI()));
    }

}

