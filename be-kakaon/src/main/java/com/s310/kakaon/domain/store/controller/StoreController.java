package com.s310.kakaon.domain.store.controller;

import com.s310.kakaon.domain.store.dto.AlertRecipientCreateRequestDto;
import com.s310.kakaon.domain.store.dto.AlertRecipientResponseDto;
import com.s310.kakaon.domain.store.dto.AlertRecipientUpdateRequestDto;
import com.s310.kakaon.domain.store.dto.StoreCreateRequestDto;
import com.s310.kakaon.domain.store.dto.StoreResponseDto;
import com.s310.kakaon.domain.store.service.AlertService;
import com.s310.kakaon.domain.store.service.StoreService;
import com.s310.kakaon.domain.store.service.StoreServiceImpl;
import com.s310.kakaon.global.dto.ApiResponse;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
@Slf4j
public class StoreController {

    private final StoreService storeService;
    private final AlertService alertService;

    //jwt 구현 이후 작업
    @PostMapping
    public ResponseEntity<ApiResponse<StoreResponseDto>> registerStore(
            @AuthenticationPrincipal CustomMemberDetails memberDetails,
            StoreCreateRequestDto request,
            HttpServletRequest httpRequest
    ){
        StoreResponseDto response = storeService.registerStore(memberDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(HttpStatus.CREATED, "가맹점 등록 성공", response, httpRequest.getRequestURI()));
    }

    @DeleteMapping("/{storeId}")
    public ResponseEntity<ApiResponse<Void>> deleteStore(
            @AuthenticationPrincipal CustomMemberDetails memberDetails,
            @PathVariable Long storeId,
            HttpServletRequest httpRequest
    ){
        storeService.deleteStore(memberDetails.getId(), storeId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "가맹점 삭제 성공", null , httpRequest.getRequestURI()));
    }


    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<StoreResponseDto>> findStoreById(
            @AuthenticationPrincipal CustomMemberDetails memberDetails,
            @PathVariable Long storeId,
            HttpServletRequest httpRequest
    ){
        StoreResponseDto response = storeService.findStoreById(memberDetails.getId(), storeId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "가맹점 조회 성공", response, httpRequest.getRequestURI()));
    }

    @PostMapping("/{storeId}/alert-recipient")
    public ResponseEntity<ApiResponse<AlertRecipientResponseDto>> registerAlert(
            @AuthenticationPrincipal CustomMemberDetails memberDetails,
            @PathVariable Long storeId,
            AlertRecipientCreateRequestDto request,
            HttpServletRequest httpRequest
    ){
        AlertRecipientResponseDto response = alertService.registerAlert(storeId, memberDetails.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.of(HttpStatus.CREATED, "알림 수신자 등록 성공", response, httpRequest.getRequestURI()));
    }

    @PatchMapping("/{storeId}/alert-recipient/{alertId}")
    public ResponseEntity<ApiResponse<AlertRecipientResponseDto>> updateAlert(
            @AuthenticationPrincipal CustomMemberDetails memberDetails,
            @PathVariable Long storeId,
            @PathVariable Long alertId,
            AlertRecipientUpdateRequestDto request,
            HttpServletRequest httpRequest
    ) {
        AlertRecipientResponseDto response = alertService.updateAlert(storeId, memberDetails.getId(), alertId, request);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "알림 수신자 수정 성공", response, httpRequest.getRequestURI()));
    }

    @DeleteMapping("/{storeId}/alert-recipient/{alertId}")
    public ResponseEntity<ApiResponse<Void>> deleteAlert(
            @AuthenticationPrincipal CustomMemberDetails memberDetails,
            @PathVariable Long storeId,
            @PathVariable Long alertId,
            HttpServletRequest httpRequest
    ) {
        alertService.deleteAlert(storeId, memberDetails.getId(), alertId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "알림 수신자 삭제 성공", null , httpRequest.getRequestURI()));
    }

}
