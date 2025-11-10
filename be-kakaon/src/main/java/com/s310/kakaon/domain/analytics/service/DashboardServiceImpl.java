package com.s310.kakaon.domain.analytics.service;

import com.s310.kakaon.domain.analytics.dto.DashboardSummaryResponseDto;
import com.s310.kakaon.domain.analytics.dto.MonthlySalesResponseDto;
import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.payment.service.SalesCacheService;
import com.s310.kakaon.domain.paymentstats.entity.PaymentStats;
import com.s310.kakaon.domain.paymentstats.repository.PaymentStatsRepository;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardServiceImpl implements DashboardService {

    private final StoreRepository storeRepository;
    private final MemberRepository memberRepository;
    private final PaymentStatsRepository paymentStatsRepository;
    private final SalesCacheService salesCacheService;

    @Override
    public DashboardSummaryResponseDto getDashboardSummary(Long storeId, Long memberId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        if (!store.getMember().getId().equals(member.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate lastWeekSameDay = today.minusWeeks(1);
        LocalDate monthStart = today.withDayOfMonth(1);
        LocalDate weekStart = today.minusDays(6);

        // 오늘 실시간 매출 (redis)
        String redisDate = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int todaySales = salesCacheService.getSalesStats(storeId, redisDate).getTotalSales();

        // 어제 매출
        int yesterdaySales = paymentStatsRepository
                .findByStoreIdAndStatsDate(storeId, yesterday)
                .map(PaymentStats::getTotalSales)
                .orElse(0);

        // 어제 대비 증감률
        double yesterdayGrowthRate = calcGrowthRate(yesterdaySales, todaySales);

        // 저번 주 동일 요일 매출
        int lastWeekSales = paymentStatsRepository
                .findByStoreIdAndStatsDate(storeId, lastWeekSameDay)
                .map(PaymentStats::getTotalSales)
                .orElse(0);

        // 전주 동요일 대비 증감률
        double lastWeekGrowthRate = calcGrowthRate(lastWeekSales, todaySales);

        // 이번 달 누적 매출
        int monthlyTotalSales = paymentStatsRepository
                .findByStoreIdAndStatsDateBetween(storeId, monthStart, today)
                .stream()
                .mapToInt(PaymentStats::getTotalSales)
                .sum();
        monthlyTotalSales += todaySales;

        // 저번 달 누적 매출
        LocalDate lastMonthStart = YearMonth.from(monthStart).minusMonths(1).atDay(1);
        LocalDate lastMonthEnd = YearMonth.from(lastMonthStart).atEndOfMonth();
        int lastMonthTotalSales = paymentStatsRepository
                .findByStoreIdAndStatsDateBetween(storeId, lastMonthStart, lastMonthEnd)
                .stream()
                .mapToInt(PaymentStats::getTotalSales)
                .sum();

        // 전달 대비 증감률
        double lastMonthGrowthRate = calcGrowthRate(lastMonthTotalSales, monthlyTotalSales);



        // 최근 7일 매출 (과거부터 현재 순서)
        List<DashboardSummaryResponseDto.DailySalesDto> last7days = paymentStatsRepository
                .findByStoreIdAndStatsDateBetween(storeId, weekStart, yesterday)
                .stream()
                .sorted(Comparator.comparing(PaymentStats::getStatsDate))  // 날짜 오름차순 정렬
                .map(ps -> DashboardSummaryResponseDto.DailySalesDto.builder()
                        .date(ps.getStatsDate().toString())
                        .totalSales(ps.getTotalSales())
                        .build()
                )
                .collect(Collectors.toList());

        // 오늘 데이터 마지막에 추가
        last7days.add(DashboardSummaryResponseDto.DailySalesDto.builder()
                .date(today.toString())
                .totalSales(todaySales)
                .build()
        );


        return DashboardSummaryResponseDto.builder()
                .storeId(storeId)
                .date(today.toString())
                .todaySales(todaySales)
                .yesterdaySales(yesterdaySales)
                .yesterdayGrowthRate(yesterdayGrowthRate)
                .lastWeekSameDaySales(lastWeekSales)
                .lastWeekGrowthRate(lastWeekGrowthRate)
                .monthlyTotalSales(monthlyTotalSales)
                .monthlyGrowthRate(lastMonthGrowthRate)
                .recent7Days(last7days)
                .build();
    }

    /**
     * first 대비 second 증감률
     * @param firstSales second와 비교할 이전 매출 데이터
     * @param secondSales 현재 매출 데이터
     * @return 증감률(-100%~999%)
     */
    public Double calcGrowthRate(int firstSales, int secondSales) {
        Double growthRate = 0.0;
        if (firstSales == 0) {
            growthRate = secondSales > 0 ? 999.0 : 0.0;  // 전 비교 데이터 없고 현재 데이터만 있음 → 999% (무한대)
        } else {
            growthRate = ((double) (secondSales - firstSales) / firstSales) * 100;
        }
        return growthRate;
    }

    @Override
    public MonthlySalesResponseDto getMonthlySales(Long storeId, Long memberId, LocalDate date) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        if (!store.getMember().getId().equals(member.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }

        LocalDate firstDay = date.withDayOfMonth(1);
        LocalDate lastDay = date.withDayOfMonth(date.lengthOfMonth());

        List<MonthlySalesResponseDto.DailySales> dailSalesList =
                paymentStatsRepository.findByStoreIdAndStatsDateBetween(storeId, firstDay, lastDay)
                        .stream()
                        .map(ps -> MonthlySalesResponseDto.DailySales.builder()
                                .date(ps.getStatsDate().toString())
                                .storeSales(ps.getTotalSales() - ps.getDeliverySales())
                                .deliverySales(ps.getDeliverySales())
                                .totalSales(ps.getTotalSales())
                                .build()
                        ).toList();
        return MonthlySalesResponseDto.builder()
                .storeId(storeId)
                .month(date.getYear() + "-" + String.format("%02d", date.getMonthValue()))
                .dailySales(dailSalesList)
                .build();
    }


}
