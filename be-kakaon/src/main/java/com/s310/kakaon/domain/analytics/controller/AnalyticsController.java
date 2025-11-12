package com.s310.kakaon.domain.analytics.controller;

import com.s310.kakaon.domain.analytics.dto.SalesHourlyResponseDto;
import com.s310.kakaon.domain.analytics.dto.SalesPeriodRequestDto;
import com.s310.kakaon.domain.analytics.dto.SalesPeriodResponseDto;
import com.s310.kakaon.domain.analytics.service.AnalyticsService;
import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.global.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.Table;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Analytics", description = "가맹점 별 매출 분석 정보 조회 API")
@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final MemberService memberService;
    private final AnalyticsService analyticsService;

    @Operation(
            summary = "기간별 매출 조회",
            description = """
                    기간 타입(주/월/년/선택),
                    조회 시작 날짜 (기간 타입 "선택" 시 필수), 
                    조회 종료 날짜 (기간 타입 "선택" 시 필수)
                    """
    )
    @GetMapping("/{storeId}/sales/period")
    public ResponseEntity<ApiResponse<SalesPeriodResponseDto>> getSalesByPeriod(
            @PathVariable Long storeId,
            @AuthenticationPrincipal String kakaoId,
            @ParameterObject @ModelAttribute SalesPeriodRequestDto period,
            HttpServletRequest request
            )
    {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        SalesPeriodResponseDto response = analyticsService.getSalesByPeriod(storeId, memberId, period);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "기간별 매출 조회 성공", response, request.getRequestURI()));
    }

    @GetMapping("/{storeId}/sales/hourly")
    public ResponseEntity<ApiResponse<SalesHourlyResponseDto>> getHourlyAvgSalesByPeriod(
            @PathVariable Long storeId,
            @AuthenticationPrincipal String kakaoId,
            @ParameterObject @ModelAttribute SalesPeriodRequestDto period,
            HttpServletRequest request
    )
    {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        SalesHourlyResponseDto response = analyticsService.getHourlyByPeriod(storeId, memberId, period);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "시간대별 평균 매출 조회 성공",  response, request.getRequestURI()));
    }
}
