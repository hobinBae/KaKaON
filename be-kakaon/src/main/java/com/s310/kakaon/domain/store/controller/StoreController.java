package com.s310.kakaon.domain.store.controller;

import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.domain.store.dto.*;
import com.s310.kakaon.domain.store.service.AlertService;
import com.s310.kakaon.domain.store.service.StoreService;
import com.s310.kakaon.domain.store.service.StoreServiceImpl;
import com.s310.kakaon.global.dto.ApiResponse;
import com.s310.kakaon.global.oauth2.CustomOAuth2User;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
@Slf4j
public class StoreController {

    private final StoreService storeService;
    private final AlertService alertService;
    private final MemberService memberService;

    //jwt 구현 이후 작업
    @PostMapping
    public ResponseEntity<ApiResponse<StoreResponseDto>> registerStore(
            @AuthenticationPrincipal String kakaoId,
            @RequestBody StoreCreateRequestDto request,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        StoreResponseDto response = storeService.registerStore(memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(HttpStatus.CREATED, "가맹점 등록 성공", response, httpRequest.getRequestURI()));
    }

    @PostMapping("/open/{storeId}")
    public ResponseEntity<ApiResponse<Void>> openStore(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        storeService.updateOperationStatus(memberId, storeId, OperationStatus.OPEN);

        return
    }

    @PostMapping("/close/{storeId}")
    public ResponseEntity<ApiResponse<Void>> closeStore(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        storeService.updateOperationStatus(memberId, storeId, OperationStatus.CLOSED);

        return
    }


    @DeleteMapping("/{storeId}")
    public ResponseEntity<ApiResponse<Void>> deleteStore(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            HttpServletRequest httpRequest
    ) {

        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        storeService.deleteStore(memberId, storeId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "가맹점 삭제 성공", null, httpRequest.getRequestURI()));
    }


    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<StoreResponseDto>> findStoreById(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        StoreResponseDto response = storeService.findStoreById(memberId, storeId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "가맹점 조회 성공", response, httpRequest.getRequestURI()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StoreResponseDto>>> getMyStores(
            @AuthenticationPrincipal String kakaoId,
            HttpServletRequest httpRequest
    ) {
//        List<StoreResponseDto> response = storeService.getMyStores(memberDetails.getId());
//        return ResponseEntity.status(HttpStatus.OK)
//                .body(ApiResponse.of(HttpStatus.OK, "내 가맹점 리스트 조회 성공", response, httpRequest.getRequestURI()));

        List<StoreResponseDto> dummyStores = List.of(
                StoreResponseDto.builder()
                        .storeId(1L)
                        .ownerName("홍길동")
                        .businessType(BusinessType.RESTAURANT)
                        .address("서울 강남구 테헤란로 123")
                        .name("강남점")
                        .phone("02-1234-5678")
                        .businessNumber("123-45-67890")
                        .status(StoreStatus.OPEN)
                        .totalSales(6200000L)
                        .cancelRate(3.2)
                        .changeRate(12.5)
                        .alertCount(2)
                        .build(),
                StoreResponseDto.builder()
                        .storeId(2L)
                        .ownerName("홍길동")
                        .businessType(BusinessType.CAFE)
                        .address("서울 마포구 양화로 45")
                        .name("홍대점")
                        .phone("02-9876-5432")
                        .businessNumber("234-56-78901")
                        .status(StoreStatus.OPEN)
                        .totalSales(5800000L)
                        .cancelRate(2.8)
                        .changeRate(8.3)
                        .alertCount(1)
                        .build()
        );
        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "✅ 더미 데이터로 가맹점 리스트 조회 성공", dummyStores, httpRequest.getRequestURI())
        );
    }

    @PostMapping("/{storeId}/alert-recipient")
    public ResponseEntity<ApiResponse<AlertRecipientResponseDto>> registerAlert(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            @RequestBody AlertRecipientCreateRequestDto request,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        AlertRecipientResponseDto response = alertService.registerAlert(storeId, memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(HttpStatus.CREATED, "알림 수신자 등록 성공", response, httpRequest.getRequestURI()));
    }

    @PatchMapping("/{storeId}/alert-recipient/{alertId}")
    public ResponseEntity<ApiResponse<AlertRecipientResponseDto>> updateAlert(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            @PathVariable Long alertId,
            @RequestBody AlertRecipientUpdateRequestDto request,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        AlertRecipientResponseDto response = alertService.updateAlert(storeId, memberId, alertId, request);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "알림 수신자 수정 성공", response, httpRequest.getRequestURI()));
    }

    @DeleteMapping("/{storeId}/alert-recipient/{alertId}")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            @PathVariable Long alertId,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        alertService.deleteAlert(storeId, memberId, alertId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "알림 수신자 삭제 성공", null, httpRequest.getRequestURI()));
    }

}
