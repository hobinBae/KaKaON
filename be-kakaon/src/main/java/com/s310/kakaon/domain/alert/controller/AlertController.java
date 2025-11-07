package com.s310.kakaon.domain.alert.controller;


import com.s310.kakaon.domain.alert.dto.AlertDetailResponseDto;
import com.s310.kakaon.domain.alert.dto.AlertResponseDto;
import com.s310.kakaon.domain.alert.dto.AlertSearchRequestDto;
import com.s310.kakaon.domain.alert.dto.AlertUnreadCountResponseDto;
import com.s310.kakaon.domain.alert.service.AlertService;
import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.global.dto.ApiResponse;
import com.s310.kakaon.global.dto.PageResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/alerts")
public class AlertController {

    private final AlertService alertService;
    private final MemberService memberService;

    // 매장 아이디
    // 조회 기간 오늘, 이번주, 이번달, 올해, 언제부터 언제 기간 검색
    // 유형
    // 상태 : 전체, 미확인, 확인됨
    @GetMapping("/{storeId}")
    public ResponseEntity<ApiResponse<PageResponse<AlertResponseDto>>> getAnomalyAlerts(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            @RequestBody AlertSearchRequestDto request, //전체가 null이면 전체 데이터
            Pageable pageable,
            HttpServletRequest httpRequest
    ) {

        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        PageResponse<AlertResponseDto> response = alertService.getAnomalyAlerts(storeId, memberId, request, pageable);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "이상 거래 알림 목록 조회 성공", response, httpRequest.getRequestURI()));
    }

    //모두 읽음 표시
    @PatchMapping("/{storeId}/all")
    public ResponseEntity<ApiResponse<PageResponse<AlertResponseDto>>> checkedAnomalyAlerts(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            Pageable pageable,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        PageResponse<AlertResponseDto> response = alertService.checkedAnomalyAlerts(memberId, storeId, pageable);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "모두 읽음 처리 성공", response, httpRequest.getRequestURI()));
    }


    //단건 조회
    @GetMapping("/detail/{alertId}")
    public ResponseEntity<ApiResponse<AlertDetailResponseDto>> getAnomalyAlert(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long alertId,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        AlertDetailResponseDto response = alertService.getAnomalyAlert(memberId, alertId);

        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "이상 거래 알림 상세 조회 성공", response, httpRequest.getRequestURI()));
    }

    @GetMapping("/{storeId}/unread-count")
    public ResponseEntity<ApiResponse<AlertUnreadCountResponseDto>> getUnreadAlertCount(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable Long storeId,
            HttpServletRequest httpRequest
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        AlertUnreadCountResponseDto response = alertService.getUnreadAlertCount(memberId, storeId);
        return ResponseEntity.status(HttpStatus.OK)
                .body(ApiResponse.of(HttpStatus.OK, "미확인 알림 개수 조회 성공", response, httpRequest.getRequestURI()));
    }

}
