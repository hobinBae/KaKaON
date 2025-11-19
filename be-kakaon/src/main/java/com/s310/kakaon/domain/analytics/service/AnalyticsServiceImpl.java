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
                long total = monthlyStats.stream().mapToLong(MonthlySalesDto::getTotalSales).sum();

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

        long total = statsList.stream().mapToLong(PaymentStats::getTotalSales).sum();


        List<SalesPeriodResponseDto.SalesData> list = statsList.stream()
                .sorted((Comparator.comparing(PaymentStats::getStatsDate)))
                .map(ps -> SalesPeriodResponseDto.SalesData.builder()
                        .date(ps.getStatsDate().toString())
                        .sales(ps.getTotalSales().longValue())
                        .build()
                ).collect(Collectors.toList());

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

        switch (periodType.toUpperCase()) {

            case "TODAY" :

                hourlyList = paymentStatsHourlyRepository.findAvgHourlySalesByPeriod(storeId, periodType, today, today).stream()
                        .map(hs -> SalesHourlyResponseDto.HourlyData.builder()
                                .hour(hs.getHour())
                                .avgSales(hs.getAvgTotalSales())
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

                start = today.minusDays(6);
                end = today;
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
                end = today;
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
                endDate = today;
                break;

            case "MONTH":
                startDate = today.withDayOfMonth(1);
                endDate = today;
                break;

            case "YEAR":
                startDate = LocalDate.of(today.getYear(), 1, 1);
                endDate = today;
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

        return CancelRateResponseDto.builder()
                .storeId(storeId)
                .periodType(periodType)
                .startDate(startDate.toString())
                .endDate(today.toString())
                .cancelRateList(list)
                .build();
    }

    @Override
    public StoreSalesResponseDto getStoreSalesByPeriod(Long memberId, SalesPeriodRequestDto period) {
        memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        String periodType = period.getPeriodType();
        LocalDate startDate = period.getStartDate();
        LocalDate endDate = period.getEndDate();
        LocalDate today = LocalDate.now();

        switch (periodType.toUpperCase()) {
            case "WEEK":
                startDate = today.minusDays(6);
                endDate = today;
                break;

            case "MONTH":
                startDate = today.withDayOfMonth(1);
                endDate = today;
                break;

            case "YEAR":
                startDate = LocalDate.of(today.getYear(), 1, 1);
                endDate = today;
                break;

            case "RANGE":
                if (startDate == null || endDate == null) {
                    throw new ApiException(ErrorCode.PERIOD_NOT_FOUND);
                }
                break;

            default:
                throw new ApiException(ErrorCode.INVALID_PERIOD);
        }

        List<StoreSalesResponseDto.StoreSalesDto> storeList = paymentStatsRepository.findStoreSalesByPeriod(memberId, periodType, startDate, endDate);

        return StoreSalesResponseDto.builder()
                .memberId(memberId)
                .periodType(periodType)
                .startDate(startDate.toString())
                .endDate(storeList.toString())
                .storeSalesList(storeList)
                .build();
    }



}
