package com.s310.kakaon.domain.store.controller;

import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.domain.store.dto.*;
import com.s310.kakaon.domain.store.service.AlertRecipientService;
import com.s310.kakaon.domain.store.service.StoreService;
import com.s310.kakaon.global.dto.ApiResponse;
import com.s310.kakaon.global.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.PathMatcher;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Store", description = "가맹점 등록, 수정, 삭제 및 영업 상태 관리 API")
@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
@Slf4j
public class StoreController {

    private final StoreService storeService;
    private final AlertRecipientService alertService;
    private final MemberService memberService;
    private final PathMatcher pathMatcher;


    @Operation(summary = "가맹점 등록", description = "로그인한 회원이 새로운 가맹점을 등록합니다.")
    @PostMapping
    public ResponseEntity<ApiResponse<StoreDetailResponseDto>> registerStore(
            @AuthenticationPrincipal String kakaoId,
            @RequestBody StoreCreateRequestDto request,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        StoreDetailResponseDto response = storeService.registerStore(memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(HttpStatus.CREATED, "가맹점 등록 성공", response, httpRequest.getRequestURI()));
    }

    @PatchMapping("/{storeId}")
    public ResponseEntity<ApiResponse<StoreDetailResponseDto>> updateStore(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            @RequestBody StoreUpdateRequestDto request,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        StoreDetailResponseDto response = storeService.updateStore(memberId, storeId, request);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "가맹점 정보 수정 성공", response, httpRequest.getRequestURI()));
    }

    @Operation(summary = "가맹점 영업 상태 조회", description = "해당 가맹점의 현재 영업 상태를 조회합니다.")
    @GetMapping("/{storeId}/operation-status")
    public ResponseEntity<ApiResponse<OperationStatusUpdateResponseDto>> getOperationStatus(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        OperationStatusUpdateResponseDto response = storeService.getOperationStatus(memberId, storeId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "영업 상태 조회 성공", response, httpRequest.getRequestURI()));
    }

    @Operation(summary = "가맹점 영업 시작", description = "해당 가맹점을 영업 상태로 변경합니다.")
    @PostMapping("/{storeId}/open")
    public ResponseEntity<ApiResponse<OperationStatusUpdateResponseDto>> openStore(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            @RequestBody OperationStatusUpdateRequestDto request,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        OperationStatusUpdateResponseDto response = storeService.updateOperationStatus(memberId, storeId, request);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "영업 시작 성공", response, httpRequest.getRequestURI()));
    }

    @Operation(summary = "가맹점 영업 종료", description = "해당 가맹점을 영업 종료 상태로 변경합니다.")
    @PostMapping("/{storeId}/close")
    public ResponseEntity<ApiResponse<OperationStatusUpdateResponseDto>> closeStore(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            @RequestBody OperationStatusUpdateRequestDto request,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        OperationStatusUpdateResponseDto response = storeService.updateOperationStatus(memberId, storeId, request);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "영업 종료 성공", response, httpRequest.getRequestURI()));
    }


    @Operation(summary = "가맹점 삭제", description = "회원이 소유한 특정 가맹점을 삭제(비활성화)합니다.")
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


    @Operation(summary = "가맹점 상세 조회", description = "storeId로 가맹점 정보를 조회합니다.")
    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<StoreDetailResponseDto>> findStoreById(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        StoreDetailResponseDto response = storeService.findStoreById(memberId, storeId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "가맹점 조회 성공", response, httpRequest.getRequestURI()));
    }

    @Operation(summary = "내 가맹점 목록 조회", description = "로그인한 회원이 소유한 가맹점 리스트를 조회합니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<StoreResponseDto>>> getMyStores(
            @AuthenticationPrincipal String kakaoId,
            Pageable pageable,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        PageResponse<StoreResponseDto> response = storeService.getMyStores(memberId, pageable);

        return ResponseEntity.ok(
                ApiResponse.of(HttpStatus.OK, "가맹점 리스트 조회 성공", response, httpRequest.getRequestURI())
        );
    }

    @Operation(summary = "알림 수신자 등록", description = "가맹점에 대한 알림 수신자를 추가 등록합니다.")
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

    @Operation(summary = "알림 수신자 수정", description = "기존에 등록된 알림 수신자의 정보를 수정합니다.")
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

    @Operation(summary = "알림 수신자 삭제", description = "등록된 알림 수신자를 삭제합니다.")
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
