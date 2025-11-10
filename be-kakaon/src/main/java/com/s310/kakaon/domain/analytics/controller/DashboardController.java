package com.s310.kakaon.domain.analytics.controller;

import com.s310.kakaon.domain.analytics.dto.DashboardSummaryResponseDto;
import com.s310.kakaon.domain.analytics.service.DashboardService;
import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.global.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboard", description = "가맹점 별 매출 요약 정보 조회 API")
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final MemberService memberService;

    @Operation(
            summary = "가맹점별 매출 요약 조회",
            description = """
                    특정 가맹점의 매출 요약 정보를 조회합니다.
                    """
    )
    @GetMapping("/{storeId}/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryResponseDto>> getDashboardSummary(
            @PathVariable Long storeId, @AuthenticationPrincipal String kakaoId,
            HttpServletRequest request
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        DashboardSummaryResponseDto response = dashboardService.getDashboardSummary(storeId, memberId);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "가맹점 대시보드 요약 정보 조회 성공", response, request.getRequestURI()));
    }
}
