package com.s310.kakaon.domain.store.service;

import com.s310.kakaon.domain.alert.dto.UnreadCountProjection;
import com.s310.kakaon.domain.alert.repository.AlertRepository;
import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.order.entity.OrderStatus;
import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.order.repository.OrderRepository;
import com.s310.kakaon.domain.payment.dto.PaymentMethod;
import com.s310.kakaon.domain.payment.dto.PaymentStatus;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.payment.repository.PaymentRepository;
import com.s310.kakaon.domain.payment.service.SalesCacheService;
import com.s310.kakaon.domain.paymentstats.entity.PaymentStats;
import com.s310.kakaon.domain.paymentstats.repository.PaymentStatsRepository;
import com.s310.kakaon.domain.store.dto.*;

import com.s310.kakaon.domain.store.entity.BusinessHour;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.mapper.StoreMapper;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.dto.PageResponse;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoreServiceImpl implements StoreService{

    private final MemberRepository memberRepository;
    private final StoreRepository storeRepository;
    private final AlertRepository alertRepository;
    private final PaymentRepository paymentRepository;
    private final StoreMapper storeMapper;
    private final PaymentStatsRepository paymentStatsRepository;
    private final SalesCacheService salesCacheService;

    private static final String REDIS_KEY_PREFIX = "store:operation:startTime:";

    private final StringRedisTemplate stringRedisTemplate;

    @Override
    @Transactional
    public StoreDetailResponseDto registerStore(Long memberId, StoreCreateRequestDto request) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        if(storeRepository.existsByBusinessNumber(request.getBusinessNumber())){
            throw new ApiException(ErrorCode.BUSINESS_NUMBER_ALREADY_EXISTS);
        }

        Store store = storeMapper.toEntity(request, member);

        storeRepository.save(store);

        return storeMapper.fromEntity(store);

    }

    @Override
    @Transactional(readOnly = true)
    public StoreDetailResponseDto findStoreById(Long memberId, Long storeId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        validateStoreOwner(store, member);

        return storeMapper.fromEntity(store);
    }

    @Override
    @Transactional
    public OperationStatusUpdateResponseDto updateOperationStatus(Long memberId, Long storeId, OperationStatusUpdateRequestDto request){
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        validateStoreOwner(store, member);

        OperationStatus newStatus = request.getStatus();

        store.updateOperationStatus(newStatus);

        String redisKey = REDIS_KEY_PREFIX + storeId;

        //레디스에 영업 시작 시간을 저장
        //영업종료를 누르면 레디스에 시작 시간 삭제
        if (newStatus.equals(OperationStatus.CLOSED)) {

            stringRedisTemplate.delete(redisKey);
            log.info("[영업 종료] Redis 키 삭제: {}", redisKey);

        }else if(newStatus.equals(OperationStatus.OPEN)){

            Double avgAmount = paymentRepository.findAveragePaymentAmountLastMonth(store);

            Map<String, String> data = new HashMap<>();

            data.put("startTime", LocalDateTime.now().toString());
            data.put("avgPaymentAmountPrevMonth", String.valueOf(avgAmount));

            stringRedisTemplate.opsForHash().putAll(redisKey, data);
            log.info("[영업 시작] storeId={}, 전월 평균 결제금액={}", store.getId(), avgAmount);

        }

        return OperationStatusUpdateResponseDto.builder()
                .updatedAt(LocalDateTime.now())
                .status(store.getOperationStatus())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public OperationStatusUpdateResponseDto getOperationStatus(Long memberId, Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        if (store.getOperationStatus().equals(OperationStatus.CLOSED)) {
            return OperationStatusUpdateResponseDto.builder()
                    .updatedAt(null)
                    .status(store.getOperationStatus())
                    .build();
        }

            String redisKey = REDIS_KEY_PREFIX + storeId;
            Object startTimeObj = stringRedisTemplate.opsForHash().get(redisKey, "startTime");

            LocalDateTime updatedAt = store.getLastModifiedDateTime();;

            if(startTimeObj != null){
                String startTime = startTimeObj.toString();
                try{
                    updatedAt = LocalDateTime.parse(startTime);
                }catch(DateTimeParseException e){
                    log.warn("[STORE {}] Redis 영업 시작 시각 파싱 실패, DB lastModified 로 대체. value={}", storeId, startTime);
                }
            }

            return OperationStatusUpdateResponseDto.builder()
                    .updatedAt(updatedAt)
                    .status(store.getOperationStatus())
                    .build();
    }

    @Override
    @Transactional
    public void deleteStore(Long memberId, Long storeId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        validateStoreOwner(store, member);

        store.delete();

    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StoreResponseDto> getMyStores(Long memberId, Pageable pageable) {

         Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Page<Store> stores = storeRepository.findByMemberId(memberId, pageable);

        List<UnreadCountProjection> unreadCounts =
                alertRepository.countUnreadByMemberIdGroupedByStore(memberId);

        Map<Long, Long> unreadCountMap = unreadCounts.stream()
                .collect(Collectors.toMap(
                        UnreadCountProjection::getStoreId,
                        UnreadCountProjection::getUnreadCount
                ));

        // 매출 내역 조회
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate weekStart = today.minusDays(6);
        LocalDate monthStart = today.withDayOfMonth(1);
        String redisDate = today.format(DateTimeFormatter.ofPattern("yyyyMMdd"));


        Page<StoreResponseDto> responsePage = stores.map(store -> {
            Long storeId = store.getId();
            Long unreadCount = unreadCountMap.getOrDefault(storeId, 0L);
            Long currentFavoriteStore = member.getFavoriteStore() != null
                    ? member.getFavoriteStore().getId()
                    : null;
            // 오늘 매출 및 취소율 (Redis)
            var todayStats = salesCacheService.getSalesStats(storeId, redisDate);
            salesCacheService.getSalesStats(storeId, redisDate);
            int todaySales = todayStats.getTotalSales();
            double todayCancelRate = todayStats.getCancelRate() != null ? todayStats.getCancelRate() : 0.0;
            // 어제 매출
            int yesterdaySales = paymentStatsRepository
                    .findByStoreIdAndStatsDate(storeId, yesterday)
                    .map(PaymentStats::getTotalSales)
                    .orElse(0);
            // 전일 대비 증감률
            double yesterdayGrowthRate = calcGrowthRate(yesterdaySales, todaySales);
            // 이번주 누적 매출
            int weeklySales = paymentStatsRepository
                    .findByStoreIdAndStatsDateBetween(storeId, weekStart, yesterday)
                    .stream()
                    .mapToInt(PaymentStats::getTotalSales)
                    .sum() + todaySales;
            // 이번달 누적 매출
            int monthlySales = paymentStatsRepository
                    .findByStoreIdAndStatsDateBetween(storeId, monthStart, yesterday)
                    .stream()
                    .mapToInt(PaymentStats::getTotalSales)
                    .sum() + todaySales;
            return storeMapper.toResponseDto(store, unreadCount, todaySales, yesterdayGrowthRate, weeklySales, monthlySales, todayCancelRate, currentFavoriteStore);
        });

        return PageResponse.from(responsePage);
    }

    private double calcGrowthRate(int yesterdaySales, int todaySales) {
        Double growthRate = 0.0;
        if (yesterdaySales == 0) {
            growthRate = todaySales > 0 ? 999.0 : 0.0;  // 전 비교 데이터 없고 현재 데이터만 있음 → 999% (무한대)
        } else {
            growthRate = ((double) (todaySales - yesterdaySales) / yesterdaySales) * 100;
        }
        return growthRate;
    }

    @Override
    @Transactional
    public StoreDetailResponseDto updateStore(Long memberId, Long storeId, StoreUpdateRequestDto request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        validateStoreOwner(store, member);
        if(request.getName() != null){
            store.updateName(request.getName());
        }

        if (request.getPhone() != null) {
            store.updatePhone(request.getPhone());
        }

        if(request.getBusinessType() != null){
            store.updateBusinessType(request.getBusinessType());
        }

        if (request.getBusinessHours() != null) {
            List<BusinessHour> newBusinessHours = request.getBusinessHours().stream()
                    .map(dto -> BusinessHour.builder()
                            .dayOfWeek(dto.getDayOfWeek())
                            .openTime(dto.isClosed() ? null : LocalTime.parse(dto.getOpenTime()))
                            .closeTime(dto.isClosed() ? null : LocalTime.parse(dto.getCloseTime()))
                            .closed(dto.isClosed())
                            .build())
                    .toList();
            store.updateBusinessHours(newBusinessHours);
        }

        return storeMapper.fromEntity(store);
    }

    @Override
    @Transactional
    public FavoriteResponseDto toggleFavorite(Long memberId, Long storeId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        Store currentFavorite = member.getFavoriteStore();

        if (currentFavorite != null &&  Objects.equals(currentFavorite.getId(), store.getId())) {
            member.removeFavoriteStore();
        }else{
            member.setFavoriteStore(store);
        }

        boolean isFavorite = member.getFavoriteStore() != null;

        return FavoriteResponseDto.builder()
                .storeId(store.getId())
                .isFavorite(isFavorite)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public FavoriteDetailResponseDto getFavorite(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));
        Store favoriteStore = member.getFavoriteStore();
        if (favoriteStore == null) {
            return FavoriteDetailResponseDto.builder()
                    .hasFavorite(false)
                    .build();
        } else {
            return FavoriteDetailResponseDto.builder()
                    .storeId(favoriteStore.getId())
                    .storeName(favoriteStore.getName())
                    .hasFavorite(true)
                    .build();
        }

    }

    private void validateStoreOwner(Store store, Member member) {
        if (!store.getMember().getId().equals(member.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }
    }

//    private final Random random = new Random();
//    private final SecureRandom secureRandom = new SecureRandom();
//
//    private static final int STORE_COUNT = 10000;   // 요청당 1만 개 생성
//    private static final int PAYMENTS_PER_STORE = 100; // 스토어당 결제 10개
//    private final OrderRepository orderRepository;
//    @Transactional
//    public void generate(Long memberId) {
//
//        Member member = memberRepository.findById(memberId)
//                .orElseThrow(() -> new IllegalArgumentException("Member not found"));
//
//        log.info("=== 더미데이터 생성 시작 (memberId={}) ===", memberId);
//
//        for (int i = 0; i < STORE_COUNT; i++) {
//
//            Store store = storeRepository.save(
//                    Store.builder()
//                            .member(member)
//                            .name("더미스토어_" + memberId + "_" + i)
//                            .businessNumber(generateBizNum(memberId, i))
//                            .businessType(BusinessType.RESTAURANT)
//                            .address("서울 강남구 " + i)
//                            .phone("02-" + String.format("%04d-%04d", i, i))
//                            .city("서울")
//                            .state("강남구")
//                            .postalCode("06234")
//                            .latitude(new BigDecimal("37.50" + (i % 100)))
//                            .longitude(new BigDecimal("127.03" + (i % 100)))
//                            .build()
//            );
//
//            createPaymentsForStore(store, PAYMENTS_PER_STORE);
//
//            if ((i + 1) % 1000 == 0) {
//                log.info("[생성중] {} / {} 완료...", i + 1, STORE_COUNT);
//            }
//        }
//
//        log.info("=== 더미데이터 생성 완료 (memberId={}) ===", memberId);
//    }
//
//    private void createPaymentsForStore(Store store, int count) {
//        PaymentMethod[] methods = PaymentMethod.values();
//        PaymentStatus[] statuses = {
//                PaymentStatus.APPROVED,
//                PaymentStatus.APPROVED,
//                PaymentStatus.CANCELED
//        };
//
//        for (int i = 0; i < count; i++) {
//
//            int amount = (random.nextInt(41) + 10) * 1000;
//
//            LocalDateTime approvedAt = generateRandomDateRecent60Days();
//            PaymentStatus status = statuses[random.nextInt(statuses.length)];
//
//            Orders order = orderRepository.save(
//                    Orders.builder()
//                            .store(store)
//                            .totalAmount(amount)
//                            .paidAmount(status == PaymentStatus.APPROVED ? amount : 0)
//                            .status(status == PaymentStatus.APPROVED ? OrderStatus.CREATED : OrderStatus.CANCELED)
//                            .build()
//            );
//
//            paymentRepository.save(
//                    Payment.builder()
//                            .store(store)
//                            .order(order)
//                            .authorizationNo(generateAuthorizationNo())
//                            .amount(amount)
//                            .paymentMethod(methods[random.nextInt(methods.length)])
//                            .status(status)
//                            .approvedAt(approvedAt)
//                            .canceledAt(status == PaymentStatus.CANCELED ? approvedAt.plusHours(1) : null)
//                            .delivery(random.nextBoolean())
//                            .build()
//            );
//        }
//    }
//
//    private String generateAuthorizationNo() {
//        return UUID.randomUUID().toString().replace("-", "").substring(0, 15);
//    }
//
//    private String generateBizNum(Long memberId, int idx) {
//        return String.format("%03d-%02d-%05d", memberId % 1000, memberId % 100, idx);
//    }
//
//    private LocalDateTime generateRandomDateRecent60Days() {
//        LocalDateTime end = LocalDateTime.now().minusDays(1).withHour(23).withMinute(59).withSecond(59);
//        LocalDateTime start = end.minusDays(59).withHour(0).withMinute(0).withSecond(0);
//        long startEpoch = start.toEpochSecond(java.time.ZoneOffset.UTC);
//        long endEpoch = end.toEpochSecond(java.time.ZoneOffset.UTC);
//        long randomEpoch = startEpoch + (long) (random.nextDouble() * (endEpoch - startEpoch));
//        return LocalDateTime.ofEpochSecond(randomEpoch, 0, java.time.ZoneOffset.UTC);
//    }

}
