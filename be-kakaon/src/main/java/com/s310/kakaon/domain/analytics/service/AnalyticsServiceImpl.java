package com.s310.kakaon.domain.analytics.service;

import com.s310.kakaon.domain.analytics.dto.*;
import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.payment.service.SalesCacheService;
import com.s310.kakaon.domain.paymentstats.entity.PaymentStats;
import com.s310.kakaon.domain.paymentstats.repository.PaymentStatsHourlyRepository;
import com.s310.kakaon.domain.paymentstats.repository.PaymentStatsRepository;
import com.s310.kakaon.domain.paymentstats.repository.PaymentStatsRepositoryImpl;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsServiceImpl implements AnalyticsService {

    private final PaymentStatsRepository paymentStatsRepository;
    private final PaymentStatsHourlyRepository paymentStatsHourlyRepository;
    private final StoreRepository storeRepository;
    private final MemberRepository memberRepository;
    private final SalesCacheService salesCacheService;
    private final PaymentStatsRepositoryImpl paymentStatsRepositoryImpl;

    /**
     * 가맹점의 점주가 로그인된 사람인지 확인하는 유효성 검사 메서드
     * @param storeId
     * @param memberId
     */
    private void validateOwner(Long storeId, Long memberId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        if (!store.getMember().getId().equals(member.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }
    }
    @Override
    public SalesPeriodResponseDto getSalesByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period) {

        validateOwner(storeId, memberId);

        String periodType = period.getPeriodType();
        LocalDate start = period.getStartDate();
        LocalDate end = period.getEndDate();
        LocalDate today = LocalDate.now();
        List<PaymentStats> statsList = new ArrayList<>();

        // 오늘 실시간 매출 (redis)
        String redisDate = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        Integer todaySales = salesCacheService.getSalesStats(storeId, redisDate).getTotalSales() != null ?  salesCacheService.getSalesStats(storeId, redisDate).getTotalSales() : 0;

        switch (periodType.toUpperCase()) {
            case "WEEK" :
                start = today.minusDays(6);
                end = today;
                statsList = paymentStatsRepository.findByStoreIdAndStatsDateBetween(storeId, start, end);
                break;
            case "MONTH" :
                start = today.withDayOfMonth(1);
                end = today;
                statsList = paymentStatsRepository.findByStoreIdAndStatsDateBetween(storeId, start, end);
                break;
            case "YEAR" :
//                start = LocalDate.of(today.getYear(), 1, 1);
//                end = LocalDate.of(today.getYear(), 12, 31);

                int year = today.getYear();
                List<MonthlySalesDto> monthlyStats = paymentStatsRepository.findMonthlySalesByYear(storeId, year);

                List<SalesPeriodResponseDto.SalesData> list = monthlyStats.stream()
                        .map(ms -> SalesPeriodResponseDto.SalesData.builder()
                                .date(year + "-" + String.format("%02d", ms.getMonth()))
                                .sales(ms.getTotalSales())
                                .build()
                        )
                        .toList();
                long total = monthlyStats.stream().mapToLong(MonthlySalesDto::getTotalSales).sum() + todaySales;

                return SalesPeriodResponseDto.builder()
                        .storeId(storeId)
                        .periodType("YEAR")
                        .startDate(year + "-01-01")
                        .endDate(today.toString())
                        .totalSales(total)
                        .saleList(list)
                        .build();
            case "RANGE" :
                if(start == null || end == null) {
                    throw new ApiException(ErrorCode.PERIOD_NOT_FOUND);
                }
                statsList = paymentStatsRepository.findByStoreIdAndStatsDateBetween(storeId, start, end);
                break;
            default :
                throw new ApiException(ErrorCode.INVALID_PERIOD);
        }

        long total = statsList.stream().mapToLong(PaymentStats::getTotalSales).sum() + todaySales.longValue();


        List<SalesPeriodResponseDto.SalesData> list = statsList.stream()
                .sorted((Comparator.comparing(PaymentStats::getStatsDate)))
                .map(ps -> SalesPeriodResponseDto.SalesData.builder()
                        .date(ps.getStatsDate().toString())
                        .sales(ps.getTotalSales().longValue())
                        .build()
                ).collect(Collectors.toList());


        list.add(SalesPeriodResponseDto.SalesData.builder()
                .date(today.toString())
                .sales(todaySales.longValue())
                .build()
        );

        return SalesPeriodResponseDto.builder()
                .storeId(storeId)
                .periodType(periodType)
                .startDate(start.toString())
                .endDate(end.toString())
                .totalSales(total)
                .saleList(list)
                .build();
    }

    @Override
    public SalesHourlyResponseDto getHourlyByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period) {
        validateOwner(storeId, memberId);

        String periodType = period.getPeriodType();
        LocalDate start = period.getStartDate();
        LocalDate end = period.getEndDate();
        LocalDate today = LocalDate.now();
        List<SalesHourlyResponseDto.HourlyData> hourlyList = new ArrayList<>();

        String redisDate = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        SalesStatsResponseDto redisStats = salesCacheService.getSalesStats(storeId, redisDate);

        switch (periodType.toUpperCase()) {

            case "TODAY" :


                hourlyList = redisStats.getHourlySales().stream()
                        .map(hs -> SalesHourlyResponseDto.HourlyData.builder()
                                .hour(hs.getHour())
                                .avgSales(hs.getSales().doubleValue())
                                .build()
                        ).toList();

                return SalesHourlyResponseDto.builder()
                        .storeId(storeId)
                        .periodType("TODAY")
                        .startDate(today.toString())
                        .endDate(today.toString())
                        .hourlySales(hourlyList)
                        .build();

            case "WEEK" :

                start = today.minusDays(7);
                end = today.minusDays(1);
                List<HourlyAvgDto> hourlyAvgList = paymentStatsHourlyRepository.findAvgHourlySalesByPeriod(
                        storeId, periodType, start, end);

                hourlyList = hourlyAvgList.stream()
                        .map(r -> SalesHourlyResponseDto.HourlyData.builder()
                                .hour(r.getHour())
                                .avgSales(r.getAvgTotalSales())
                                .build()
                        ).toList();
                return SalesHourlyResponseDto.builder()
                        .storeId(storeId)
                        .periodType("WEEK")
                        .startDate(start.toString())
                        .endDate(end.toString())
                        .hourlySales(hourlyList)
                        .build();
            case "MONTH" :
                start = today.withDayOfMonth(1);
                end = today.minusDays(1);
                hourlyAvgList = paymentStatsHourlyRepository.findAvgHourlySalesByPeriod(
                        storeId, periodType, start, end);

                hourlyList = hourlyAvgList.stream()
                        .map(r -> SalesHourlyResponseDto.HourlyData.builder()
                                .hour(r.getHour())
                                .avgSales(r.getAvgTotalSales())
                                .build()
                        ).toList();
                return SalesHourlyResponseDto.builder()
                        .storeId(storeId)
                        .periodType("MONTH")
                        .startDate(start.toString())
                        .endDate(end.toString())
                        .hourlySales(hourlyList)
                        .build();

            case "YEAR" :
                start = today.withDayOfYear(1);
                end = today.minusDays(1);
                hourlyAvgList = paymentStatsHourlyRepository.findAvgHourlySalesByPeriod(storeId, periodType, start, end);
                hourlyList = hourlyAvgList.stream()
                        .map(r -> SalesHourlyResponseDto.HourlyData.builder()
                                .hour(r.getHour())
                                .avgSales(r.getAvgTotalSales())
                                .build()).toList();
                return SalesHourlyResponseDto.builder()
                        .storeId(storeId)
                        .periodType("YEAR")
                        .startDate(start.toString())
                        .endDate(end.toString())
                        .hourlySales(hourlyList)
                        .build();


//                hourlyList = redisStats.getHourlySales().stream()
//                        .map(hs -> SalesHourlyResponseDto.HourlyData.builder()
//                                .hour(hs.getHour())
//                                .avgSales(hs.getSales().doubleValue())
//                                .paymentCount(hs.getPaymentCount())
//                                .build()
//                        ).toList();

            case "RANGE" :
                hourlyAvgList = paymentStatsHourlyRepository.findAvgHourlySalesByPeriod(storeId, periodType, start, end);
                hourlyList = hourlyAvgList.stream()
                        .map(r -> SalesHourlyResponseDto.HourlyData.builder()
                                .hour(r.getHour())
                                .avgSales(r.getAvgTotalSales())
                                .build()).toList();
                return SalesHourlyResponseDto.builder()
                        .storeId(storeId)
                        .periodType("RANGE")
                        .startDate(start.toString())
                        .endDate(end.toString())
                        .hourlySales(hourlyList)
                        .build();
            default :
                throw new ApiException(ErrorCode.INVALID_PERIOD);

        }
    }

    @Override
    public PaymentMethodRatioResponseDto getPaymentMethodRatioByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period) {
        validateOwner(storeId, memberId);
        String periodType = period.getPeriodType();
        LocalDate startDate = period.getStartDate();
        LocalDate endDate = period.getEndDate();
        PaymentMethodRatioResponseDto paymentMethodStats = paymentStatsRepository.findPaymentMethodStatsByPeriod(storeId, periodType, startDate, endDate);
        return paymentMethodStats;
    }

    @Override
    public CancelRateResponseDto getCancelRateByPeriod(Long storeId, Long memberId, SalesPeriodRequestDto period) {
        validateOwner(storeId, memberId);
        String periodType = period.getPeriodType();
        LocalDate startDate = period.getStartDate();
        LocalDate endDate = period.getEndDate();
        LocalDate today = LocalDate.now();

        switch (periodType.toUpperCase()) {
            case "WEEK":
                startDate = today.minusDays(6);
                endDate = today.minusDays(1);
                break;

            case "MONTH":
                startDate = today.withDayOfMonth(1);
                endDate = today.minusDays(1);
                break;

            case "YEAR":
                startDate = LocalDate.of(today.getYear(), 1, 1);
                endDate = today.minusDays(1);
                break;

            case "RANGE":
                if (startDate == null || endDate == null) {
                    throw new ApiException(ErrorCode.PERIOD_NOT_FOUND);
                }
                break;

            default:
                throw new ApiException(ErrorCode.INVALID_PERIOD);

        }

        List<CancelRateResponseDto.CancelRateDailyDto> list = paymentStatsRepository.findCancelRateByPeriod(storeId, periodType, startDate, endDate);

        // Redis에서 오늘 데이터 가져오기
        String redisDate = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        SalesStatsResponseDto todayStats = salesCacheService.getSalesStats(storeId, redisDate);
        Double todayCancelRate = todayStats.getCancelRate() != null ? todayStats.getCancelRate() : 0.0;
        Long todayPaymentCount = todayStats.getPaymentCount() != null ? todayStats.getPaymentCount().longValue() : 0L;
        Long todayCancelCount = todayStats.getCancelCount() != null ? todayStats.getCancelCount().longValue() : 0L;

        // YEAR가 아닐 때: 오늘 데이터를 리스트에 추가
        if (!periodType.equalsIgnoreCase("YEAR")) {
            list.add(CancelRateResponseDto.CancelRateDailyDto.builder()
                    .date(today.toString())
                    .cancelRate(todayCancelRate)
                    .totalSales(todayPaymentCount)
                    .cancelSales(todayCancelCount)
                    .build());

            return CancelRateResponseDto.builder()
                    .storeId(storeId)
                    .periodType(periodType)
                    .startDate(startDate.toString())
                    .endDate(today.toString())
                    .cancelRateList(list)
                    .build();
        }

        // YEAR일 때: 현재 월 데이터에 오늘 데이터를 병합하여 취소율 재계산
        String currentMonth = String.valueOf(today.getMonthValue());

        // 현재 월 데이터 찾기
        for (int i = 0; i < list.size(); i++) {
            CancelRateResponseDto.CancelRateDailyDto monthData = list.get(i);
            if (monthData.getDate().equals(currentMonth)) {
                // 현재 월의 취소건수와 판매건수에 오늘 데이터 추가
                Long updatedSalesCount = monthData.getTotalSales() + todayPaymentCount;
                Long updatedCancelCount = monthData.getCancelSales() + todayCancelCount;
                Double updatedCancelRate = updatedSalesCount > 0
                        ? (updatedCancelCount.doubleValue() / updatedSalesCount.doubleValue()) * 100.0
                        : 0.0;

                // 업데이트된 데이터로 교체
                list.set(i, CancelRateResponseDto.CancelRateDailyDto.builder()
                        .date(today.getYear() + "-" + String.format("%02d", today.getMonthValue()))
                        .cancelRate(updatedCancelRate)
                        .totalSales(updatedSalesCount)
                        .cancelSales(updatedCancelCount)
                        .build());
                break;
            }
        }

        return CancelRateResponseDto.builder()
                .storeId(storeId)
                .periodType(periodType)
                .startDate(startDate.toString())
                .endDate(today.toString())
                .cancelRateList(list)
                .build();
    }


}
