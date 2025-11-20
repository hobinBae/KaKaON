package com.s310.kakaon.domain.analytics.controller;

import com.s310.kakaon.domain.analytics.dto.*;
import com.s310.kakaon.domain.analytics.service.AnalyticsService;
import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.global.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.persistence.Table;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
                    기간 타입(WEEK(최근 7일)/MONTH/YEAR/RANGE),
                    조회 시작 날짜 (기간 타입 "RANGE" 시 필수), 
                    조회 종료 날짜 (기간 타입 "RANGE" 시 필수)
                    ** 오늘 매출 포함되어 있음
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

    @Operation(
            summary = "시간대별 평균 매출 조회",
            description = """
                    ** TODAY 제외한 기간타입의 오늘매출은 평균에 미포함ㅜ^ㅜ
                    기간 타입(TODAY/WEEK(최근 7일)/MONTH/YEAR/RANGE),
                    조회 시작 날짜 (기간 타입 "RANGE" 시 필수), 
                    조회 종료 날짜 (기간 타입 "RANGE" 시 필수)
                    """
    )
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

    @Operation(
            summary = "결제수단별 매출 합계 조회",
            description = """
                    비율 계산은 프론트에서 부탁드립니다...
                    ** 오늘 매출은 미포함..
                    기간 타입(YESTERDAY/WEEK(최근 7일)/MONTH/YEAR/RANGE),
                    조회 시작 날짜 (기간 타입 "RANGE" 시 필수), 
                    조회 종료 날짜 (기간 타입 "RANGE" 시 필수)
                    """
    )
    @GetMapping("{storeId}/sales/payment-method")
    public ResponseEntity<ApiResponse<PaymentMethodRatioResponseDto>> getPaymentMethodRatioByPeriod(
            @PathVariable Long storeId,
            @AuthenticationPrincipal String kakaoId,
            @ParameterObject @ModelAttribute SalesPeriodRequestDto period,
            HttpServletRequest request
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        PaymentMethodRatioResponseDto response = analyticsService.getPaymentMethodRatioByPeriod(storeId, memberId, period);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "결제수단별 매출 합계 조회 성공", response, request.getRequestURI()));
    }

    @Operation(
            summary = "취소율 조회",
            description = """
                    ** 오늘 매출 포함..
                    기간 타입(WEEK(최근 7일)/MONTH/YEAR/RANGE),
                    조회 시작 날짜 (기간 타입 "RANGE" 시 필수), 
                    조회 종료 날짜 (기간 타입 "RANGE" 시 필수)
                    """
    )
    @GetMapping("{storeId}/sales/cancel-rate")
    public ResponseEntity<ApiResponse<CancelRateResponseDto>> getCancelRateByPeriod(
            @PathVariable Long storeId,
            @AuthenticationPrincipal String kakaoId,
            @ParameterObject @ModelAttribute SalesPeriodRequestDto period,
            HttpServletRequest request
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        CancelRateResponseDto response = analyticsService.getCancelRateByPeriod(storeId, memberId, period);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "취소율 조회 성공", response, request.getRequestURI()));
    }

    @Operation(
            summary = "가맹점별 매출 합계 조회",
            description = """
                    오늘 매출 포함한 가맹점별 매출을 조회합니다.
                    기간 타입(WEEK(최근 7일)/MONTH/YEAR/RANGE),
                    조회 시작 날짜 (기간 타입 "RANGE" 시 필수), 
                    조회 종료 날짜 (기간 타입 "RANGE" 시 필수)
                    """
    )
    @GetMapping("sales/stores")
    public ResponseEntity<ApiResponse<StoreSalesResponseDto>> getStoreSalesByPeriod(
            @AuthenticationPrincipal String kakaoId,
            @ParameterObject @ModelAttribute SalesPeriodRequestDto period,
            HttpServletRequest request
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        StoreSalesResponseDto response = analyticsService.getStoreSalesByPeriod(memberId, period);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "가맹점별 매출 합계 조회 성공", response, request.getRequestURI()));
    }

    @Operation(
            summary = "기간별 메뉴 분석 조회",
            description = """
                    지정된 기간 동안의 메뉴별 판매량과 매출액을 조회합니다.
                    - 기간 타입(WEEK/MONTH/YEAR/RANGE)
                    - 조회 시작 날짜 (기간 타입 "RANGE" 시 필수)
                    - 조회 종료 날짜 (기간 타입 "RANGE" 시 필수)
                    """
    )
    @GetMapping("/{storeId}/menu-summary")
    public ResponseEntity<ApiResponse<MenuSummaryResponseDto>> getMenuSummaryByPeriod(
            @PathVariable Long storeId,
            @AuthenticationPrincipal String kakaoId,
            @ParameterObject @ModelAttribute SalesPeriodRequestDto period,
            HttpServletRequest request
    ) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        MenuSummaryResponseDto response = analyticsService.getMenuSummaryByPeriod(storeId, memberId, period);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "기간별 메뉴 분석 조회 성공", response, request.getRequestURI()));
    }
}
