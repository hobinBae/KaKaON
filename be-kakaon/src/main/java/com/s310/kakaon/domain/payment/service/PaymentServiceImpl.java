package com.s310.kakaon.domain.payment.service;

import com.s310.kakaon.domain.alert.dto.AlertEvent;
import com.s310.kakaon.domain.alert.entity.AlertType;
import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.order.repository.OrderRepository;
import com.s310.kakaon.domain.payment.dto.*;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.payment.entity.PaymentCancel;
import com.s310.kakaon.domain.payment.mapper.PaymentMapper;
import com.s310.kakaon.domain.payment.repository.PaymentCancelRepository;
import com.s310.kakaon.domain.payment.repository.PaymentRepository;
import com.s310.kakaon.domain.paymentstats.entity.PaymentStats;
import com.s310.kakaon.domain.paymentstats.entity.PaymentStatsHourly;
import com.s310.kakaon.domain.paymentstats.repository.PaymentStatsHourlyRepository;
import com.s310.kakaon.domain.paymentstats.repository.PaymentStatsRepository;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.dto.PageResponse;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;

import java.io.*;
import java.time.LocalDate;
import java.util.*;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService{

    private final MemberRepository memberRepository;
    private final StoreRepository storeRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final OrderRepository orderRepository;
    private final PaymentCancelRepository paymentCancelRepository;
    private final ApplicationEventPublisher publisher;
    private final StringRedisTemplate stringRedisTemplate;
    private static final String REDIS_KEY_PREFIX = "store:operation:startTime:";
    private final SalesCacheService salesCacheService;
    private final ApplicationEventPublisher eventPublisher;
    private final PaymentStatsRepository paymentStatsRepository;
    private final PaymentStatsHourlyRepository paymentStatsHourlyRepository;
    private final EntityManager entityManager;


    @Override
    @Transactional
    public PaymentResponseDto registerPayment(Long memberId, Long storeId, Long orderId, PaymentCreateRequestDto request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(ErrorCode.ORDER_NOT_FOUND));

        validateStoreOwner(store, member);

        String authorizationNo;
        boolean exists;

        // 승인번호 증복확인
        do{
            authorizationNo = generateAuthorizationNo();
            exists = paymentRepository.existsByAuthorizationNo(authorizationNo);
        }while(exists);

        Payment payment = paymentMapper.toEntity(store, order, authorizationNo, request);

        Payment savedPayment = paymentRepository.save(payment);

        // ✅ Redis 통계 즉시 반영
        salesCacheService.updatePaymentStats(storeId, payment.getAmount(), payment.getApprovedAt(), payment.getDelivery());

        // Kafka 이벤트 발행
        PaymentEventDto event = PaymentEventDto.builder()
                .paymentId(savedPayment.getId())
                .storeId(savedPayment.getStore().getId())
                .orderId(savedPayment.getOrder().getOrderId())
                .authorizationNo(savedPayment.getAuthorizationNo())
                .amount(savedPayment.getAmount())
                .paymentMethod(savedPayment.getPaymentMethod().name())
                .status(savedPayment.getStatus().name())
                .approvedAt(savedPayment.getApprovedAt())
                .canceledAt(savedPayment.getCanceledAt())
                .isDelivery(savedPayment.getDelivery())
                .createdDateTime(savedPayment.getCreatedDateTime())
                .storeLatitude(savedPayment.getStore().getLatitude())
                .storeLongitude(savedPayment.getStore().getLongitude())
                .storeName(savedPayment.getStore().getName())
                .paymentUuid(request.getPaymentUuid())
                .build();

        // 커밋 후 발사: AFTER_COMMIT 리스너가 잡아서 Kafka로 보냄
        eventPublisher.publishEvent(event);


        long t1 = System.currentTimeMillis();
        if(!detectAfterHoursTransaction(store, payment)){
            detectHighValueTransaction(store, payment);
        }
        long t2 = System.currentTimeMillis();
        log.info("[PERF] 이상거래 탐지 완료 시점: {} ms", (t2 - t1));
        return paymentMapper.fromEntity(payment);
    }

    @Override
    public void uploadPaymentsFromCsv(byte[] fileBytes, Long storeId, Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        validateStoreOwner(store, member);

        String content = new String(fileBytes, StandardCharsets.UTF_8);

        // BOM 제거 (있는 경우)
        if(content.startsWith("\uFEFF")) {
            content = content.substring(1);
        }

        String[] lines = content.split("\n");

        if(lines.length < 2) {
            throw new ApiException(ErrorCode.INVALID_CSV_FORMAT);
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        int successCount = 0;
        int failCount = 0;

        // 날짜별 Stats 캐시
        Map<LocalDate, PaymentStats> statsCache = new HashMap<>();
        Map<String, PaymentStatsHourly> hourlyCache = new HashMap<>(); // 날짜_시간 형식

        // 기존 DB의 모든 승인번호 한번에 메모리 로드
        Set<String> existingAuthNos = new HashSet<>(paymentRepository.findAllAuthorizationNos());

        // Payment 1000건씩 모아서 배치 저장
        List<Payment> paymentBatch = new ArrayList<>();
        final int BATCH_SIZE = 1000;

        // 첫 번째 라인은 헤더이므로 건너뛰기
        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();

            if (line.isEmpty()) {
                continue;
            }

            try {
                String[] fields = parseCsvLine(line);

                if (fields.length < 8) {
                    log.warn("라인 {} 스킵: 필드 수 부족 ({}개)", i + 1, fields.length);
                    failCount++;
                    continue;
                }

                // CSV 필드 파싱
                // 매장명(0), 승인번호(1), 금액(2), 결제수단(3), 상태(4), 배달여부(5), 승인일시(6), 취소일시(7)
                String storeName = fields[0].trim();
                String authorizationNo = fields[1].trim();
                Integer amount = Integer.parseInt(fields[2].trim());
                PaymentMethod paymentMethod = PaymentMethod.valueOf(fields[3].trim());
                PaymentStatus status = PaymentStatus.valueOf(fields[4].trim());
                Boolean isDelivery = "배달".equals(fields[5].trim());
                LocalDateTime approvedAt = LocalDateTime.parse(fields[6].trim(), formatter);
                LocalDateTime canceledAt = null;
                if (fields.length > 7 && !fields[7].trim().isEmpty()) {
                    canceledAt = LocalDateTime.parse(fields[7].trim(), formatter);
                }

                // 매장명 검증
                if (!storeName.equals(store.getName())) {
                    log.warn("라인 {} 스킵: 매장명 불일치 (CSV: {}, 실제: {})",  i + 1, storeName, store.getName());
                    failCount++;
                    continue;
                }

                // 승인번호 중복 체크
                if (existingAuthNos.contains(authorizationNo)) {
                    log.warn("라인 {} 스킵: 승인번호 {} 중복",  i + 1, authorizationNo);
                    failCount++;
                    continue;
                }

                // Payment 생성 (Order는 null)
                Payment payment = Payment.builder()
                        .store(store)
                        .order(null)
                        .authorizationNo(authorizationNo)
                        .amount(amount)
                        .paymentMethod(paymentMethod)
                        .status(status)
                        .approvedAt(approvedAt)
                        .canceledAt(canceledAt)
                        .delivery(isDelivery)
                        .paymentUuid("CSV_UPLOAD_" + authorizationNo)
                        .build();

                paymentBatch.add(payment);
                existingAuthNos.add(authorizationNo);

                updateStatsInMemory(statsCache, hourlyCache, store, storeId, approvedAt, amount, paymentMethod, status, isDelivery);

                successCount++;

                // 1000건마다 배치 처리
                if (paymentBatch.size() >= BATCH_SIZE) {
                    processBatch(paymentBatch);
                    log.info("배치 저장 완료: {}건 (진행 : {}/{})", BATCH_SIZE,  i, lines.length);
                }

            } catch (Exception e) {
                log.error("라인 {} 처리 중 오류: {}",  i + 1, e.getMessage(), e);
                failCount++;
            }
        }

        if(!paymentBatch.isEmpty()) {
            processBatch(paymentBatch); // 남은 배치 처리
            log.info("마지막 배치 저장 완료: {}건", paymentBatch.size());
        }
        saveStatsInBatch(statsCache, hourlyCache);

        log.info("CSV 업로드 완료: 성공 {}건, 실패 {}건", successCount, failCount);

        if (successCount == 0 && failCount > 0) {
            throw new ApiException(ErrorCode.CSV_UPLOAD_FAILED);
        }


    }

    @Async("csvUploadExecutor")
    @Override
    @Transactional
    public void uploadPaymentsFromCsvAsync(byte[] fileBytes, String fileName, Long storeId, Long memberId) {
        log.info("[비동기 CSV 업로드] 시작 - storeId: {}, memberId: {}, fileName: {}, thread: {}",
                storeId, memberId, fileName, Thread.currentThread().getName());

        long startTime = System.currentTimeMillis();

        try {
            uploadPaymentsFromCsv(fileBytes, storeId, memberId);

            long endTime = System.currentTimeMillis();
            long duration = (endTime - startTime) / 1000;

            log.info("[비동기 CSV 업로드] 완료 - storeId: {}, 소요 시간: {}초", storeId, duration);
        } catch (Exception e) {
            long endTime = System.currentTimeMillis();
            long duration = (endTime - startTime) / 1000;
            log.error("[비동기 CSV 업로드] 완료 - storeId: {}, 소요 시간: {}초", storeId, duration);
        }
    }

    /** Payment 배치를 저장하고 Persistence Context 초기화 */
    private void processBatch(List<Payment> paymentBatch) {
        // 배치 저장
        paymentRepository.saveAll(paymentBatch);

        // DB에 즉시 반영
        entityManager.flush();

        // Persistence Context 비우기 (메모리 해제)
        entityManager.clear();

        // 배치 리스트 초기화 (다음 배치 준비)
        paymentBatch.clear();
    }

    /** Payment 정보를 메모리 Stats 캐시에 집계 (DB 저장 x) */
    private void updateStatsInMemory(
            Map<LocalDate, PaymentStats> statsCache,
            Map<String, PaymentStatsHourly> hourlyCache,
            Store store,
            Long storeId,
            LocalDateTime approvedAt,
            Integer amount,
            PaymentMethod paymentMethod,
            PaymentStatus paymentStatus,
            Boolean isDelivery
    ) {
        // PaymentStats 메모리 집계
        LocalDate paymentDate = approvedAt.toLocalDate();
        PaymentStats stats = statsCache.computeIfAbsent(paymentDate, d ->
                paymentStatsRepository.findByStoreIdAndStatsDate(storeId, d)
                        .orElseGet(() -> PaymentStats.builder()
                                    .store(store)
                                    .statsDate(d)
                                    .totalSales(0)
                                    .totalCancelSales(0)
                                    .salesCnt(0L)
                                    .cancelCnt(0L)
                                    .build())
        );
        // PaymentStatsHourly 메모리 집계
        int hour = approvedAt.getHour();
        String hourlyKey = paymentDate + "_" + hour;
        PaymentStatsHourly hourly = hourlyCache.computeIfAbsent(hourlyKey, k -> {
            // stats.getId() null일 수 있으므로 먼저 저장
            if (stats.getId() != null) {
                return paymentStatsHourlyRepository.findByPaymentStatsIdAndHour(stats.getId(), hour)
                        .orElseGet(()-> PaymentStatsHourly.builder()
                                .paymentStats(stats)
                                .hour(hour)
                                .hourlyTotalSales(0)
                                .hourlyPaymentCount(0)
                                .hourlyCancelCount(0)
                                .hourlyCancelRate(0.0)
                                .build());
            }
            else {
                return paymentStatsHourlyRepository.findByPaymentStatsIdAndHour(stats.getId(), hour)
                        .orElseGet(() -> PaymentStatsHourly.builder()
                                .paymentStats(stats)
                                .hour(hour)
                                .hourlyTotalSales(0)
                                .hourlyPaymentCount(0)
                                .hourlyCancelCount(0)
                                .hourlyCancelRate(0.0)
                                .build());
            }

        });

        // 메모리에서 집계 (DB 저장 X)
        stats.applyPayment(amount, paymentMethod, isDelivery);
        hourly.applyPaymentHourly(amount);

        if(paymentStatus == PaymentStatus.CANCELED) {
            stats.applyCancel(amount, paymentMethod, isDelivery);
            hourly.applyCancelHourly(amount);
        }
    }

    /** 메모리에서 집계된 Stats를 DB에 일괄 저장 */
    private void saveStatsInBatch(
            Map<LocalDate, PaymentStats> statsCache,
            Map<String, PaymentStatsHourly> hourlyCache
    ) {
        // PaymentStats에 일괄 저장
        if (!statsCache.isEmpty()) {
            List<PaymentStats> statsList = new ArrayList<>(statsCache.values());
            paymentStatsRepository.saveAll(statsList);
            entityManager.flush();
            log.info("PaymentStats 저장 완료: {}건", statsList.size());
        }
        // PaymentStatsHourly에 일괄 저장
        if (!hourlyCache.isEmpty()) {
            List<PaymentStatsHourly> hoursList = new ArrayList<>(hourlyCache.values());
            paymentStatsHourlyRepository.saveAll(hoursList);
            entityManager.flush();
            log.info("PaymentStatsHourly 저장 완료: {}건", hoursList.size());
        }
    }

    private String[] parseCsvLine(String line) {
        List<String> fields = new ArrayList<>();
        StringBuilder currentField = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);

            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    // 이스케이프된 따옴표
                    currentField.append('"');
                    i++; // 다음 따옴표 건너뛰기
                } else {
                    // 따옴표 시작/종료
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                // 필드 구분자
                fields.add(currentField.toString());
                currentField = new StringBuilder();
            } else {
                currentField.append(c);
            }
        }

        // 마지막 필드 추가
        fields.add(currentField.toString());

        return fields.toArray(new String[0]);
    }

    @Override
    @Transactional
    public PaymentResponseDto deletePayment(Long memberId, Long id) {
       memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));

        PaymentCancel cancel = PaymentCancel.builder()
                .payment(payment)
                .canceledAmount(payment.getAmount())
                .responseCode(payment.getAuthorizationNo())
                .build();

        paymentCancelRepository.save(cancel);

        Store store = storeRepository.findById(payment.getStore().getId())
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        payment.cancel();

        String redisKey = REDIS_KEY_PREFIX + store.getId();

        Object startTimeObj = stringRedisTemplate.opsForHash().get(redisKey, "startTime");
        LocalDateTime approveTime = payment.getApprovedAt();

        boolean updateDb = shouldUpdateDb(approveTime, startTimeObj);

        if(updateDb){
            PaymentStats paymentStats = paymentStatsRepository.findByStoreIdAndStatsDate(store.getId(), payment.getApprovedAt()
                    .toLocalDate()).orElse(null);

            if(paymentStats != null){
                PaymentStatsHourly hourly =
                        paymentStatsHourlyRepository.findByPaymentStatsIdAndHour(paymentStats.getId(),
                                        payment.getApprovedAt().getHour())
                                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_STATS_NOT_FOUND));

                paymentStats.applyCancel(payment.getAmount(), payment.getPaymentMethod(), payment.getDelivery());
                hourly.applyCancelHourly(payment.getAmount());

            }else{
                //영업 첫날인데 영업시작을 안하고 거래를 했을 수도 있기때문에
                salesCacheService.updateCancelStats(payment.getStore().getId(), payment.getAmount(), payment.getApprovedAt() ,null);
            }
        }else{
            salesCacheService.updateCancelStats(payment.getStore().getId(), payment.getAmount(), payment.getApprovedAt() ,null);
        }
        return paymentMapper.fromEntity(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentResponseDto> getPaymentsByStore(Long memberId, Long storeId, PaymentSearchRequestDto request, Pageable pageable) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        validateStoreOwner(store, member);

        Page<Payment> payments = paymentRepository.searchPayments(store, request, pageable);

        Page<PaymentResponseDto> responsePage = payments.map(paymentMapper::fromEntity);

        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDto getPaymentById(Long memberId, Long id) {

        memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));

        return paymentMapper.fromEntity(payment);
    }

    public String generateAuthorizationNo(){
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yymmdd"));
        int randomPart = new SecureRandom().nextInt(100_000);
        return datePart + String.format("%05d", randomPart);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadPaymentsCsv(Long memberId, Long storeId, PaymentSearchRequestDto request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        validateStoreOwner(store, member);

        List<Payment> payments = paymentRepository.searchPaymentsForExport(store, request);

        List<PaymentResponseDto> paymentDtos = payments.stream().map(paymentMapper::fromEntity).collect(Collectors.toList());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter osw = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             PrintWriter writer = new PrintWriter(osw)) {

            // UTF-8 BOM 추가 (엑셀에서 한글 깨짐 방지)
            baos.write(0xEF);
            baos.write(0xBB);
            baos.write(0xBF);

            // CSV 헤더
            writer.println("매장명,승인번호,금액,결제수단,상태,배달여부,승인일시,취소일시");

            // CSV 데이터
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            for (PaymentResponseDto payment : paymentDtos) {
                writer.printf("%s,%s,%d,%s,%s,%s,%s,%s%n",
                        escapeCsvField(store.getName() != null ? store.getName() : ""),
                        escapeCsvField(payment.getAuthorizationCode()),
                        payment.getAmount(),
                        payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : "",
                        payment.getStatus() != null ? payment.getStatus().name() : "",
                        payment.getDelivery() != null && payment.getDelivery() ? "배달" : "매장",
                        payment.getApprovedAt() != null ? payment.getApprovedAt().format(formatter) : "",
                        payment.getCanceledAt() != null ? payment.getCanceledAt().format(formatter) : ""

                );
            }

            writer.flush();
            return baos.toByteArray();

        } catch (IOException e) {
            log.error("CSV 생성 중 오류 발생", e);
            throw new ApiException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    public List<CancelRateAnomalyDto> redisFindHourlyCancelRateAnomalies(){

        LocalDateTime now = LocalDateTime.now();
        String date = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int hour = now.getHour();
        Set<String> keys = stringRedisTemplate.keys(
                String.format("sales:hourly:rate:cancel:*:%s:%02d", date, hour)
        );

        if (keys == null || keys.isEmpty()) {
            log.info("[CancelRate] 현재 시간({}시) 취소율 데이터 없음", hour);
            return List.of();
        }

        List<CancelRateAnomalyDto> result = new ArrayList<>();

        for (String key : keys) {
            Long storeId = parseStoreId(key);
            String storeName = parseStoreName(storeId);

            String todayRateString = stringRedisTemplate.opsForValue().get(key);

            if(todayRateString == null){
                continue;
            }

            Double todayRate = Double.parseDouble(todayRateString);

            //전주 동시간
            LocalDate lastWeekDate = now.minusWeeks(1).toLocalDate();

            PaymentStats paymentStats = paymentStatsRepository.findByStoreIdAndStatsDate(storeId, lastWeekDate)
                    .orElse(null);

            if(paymentStats == null){
                log.info("해당 가맹점{}에 저번주 매출 통계가 없습니다.", storeId);
                continue;
            }

            PaymentStatsHourly paymentStatsHourly = paymentStatsHourlyRepository.findByPaymentStatsIdAndHour(
                    paymentStats.getId(), hour).orElse(null);

            if(paymentStatsHourly == null){
                log.info("해당 가맹점{}에 저번주 같은 시간{} 매출 통계가 없습니다.", storeId, hour);
                continue;
            }

            Double lastWeekRate = paymentStatsHourly.getHourlyCancelRate();

            Double increase = todayRate - lastWeekRate;

            if(increase >= 20.0){
                result.add(
                        CancelRateAnomalyDto.builder()
                                .storeId(storeId)
                                .storeName(storeName)
                                .lastWeekCancelRate(lastWeekRate)
                                .thisWeekCancelRate(todayRate)
                                .increasePercent(increase)
                                .build()
                );
            }

        }
        return result;


    }

    private Long parseStoreId(String key) {
        // sales:hourly:rate:cancel:{storeId}:{yyyyMMdd}:{HH}
        return Long.parseLong(key.split(":")[4]);
    }

    private String parseStoreName(Long storeId) {
        return storeRepository.findById(storeId)
                .map(Store::getName)
                .orElse("가맹점 이름");
    }

    @Override
    @Transactional(readOnly = true)
    public List<CancelRateAnomalyDto> findHourlyCancelRateAnomalies() {
        List<CancelRateAnomalyDto> results = paymentCancelRepository.getWeeklyCancelStats();
        return results.stream()
                .map(r -> {
                    double increase = r.getThisWeekCancelRate() - r.getLastWeekCancelRate();
                    return CancelRateAnomalyDto.builder()
                            .storeId(r.getStoreId())
                            .storeName(r.getStoreName())
                            .lastWeekCancelRate(r.getLastWeekCancelRate())
                            .thisWeekCancelRate(r.getThisWeekCancelRate())
                            .increasePercent(increase)
                            .build();
                })
                .filter(dto -> dto.getIncreasePercent() >= 20.0)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDto getPaymentByAuthorizationNo(Long memberId, String authorizationNo) {
        memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Payment payment = paymentRepository.findByAuthorizationNo(authorizationNo)
                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));

        return paymentMapper.fromEntity(payment);
    }


    private String escapeCsvField(String field) {
        if (field == null) {
            return "";
        }
        // CSV 필드에 쉼표, 따옴표, 개행이 있으면 따옴표로 감싸고 내부 따옴표는 이스케이프
        if (field.contains(",") || field.contains("\"") || field.contains("\n")) {
            return "\"" + field.replace("\"", "\"\"") + "\"";
        }
        return field;
    }

    private void validateStoreOwner(Store store, Member member) {
        if (!store.getMember().getId().equals(member.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }
    }

    public boolean detectAfterHoursTransaction(Store store, Payment payment) {
        String redisKey = REDIS_KEY_PREFIX + store.getId();


        if (!stringRedisTemplate.hasKey(redisKey)) {
            AlertEvent event = AlertEvent.builder()
                    .alertUuid(UUID.randomUUID().toString().substring(0, 20))
                    .storeId(store.getId())
                    .storeName(store.getName())
                    .alertType(AlertType.OUT_OF_BUSINESS_HOUR)
                    .description("영업시간 외 거래가 발생했습니다.")
                    .detectedAt(LocalDateTime.now())
                    .paymentId(payment.getId())
                    .build();
            publisher.publishEvent(event);
            log.info("[AlertEvent 발행] {}", event.getDescription());

            return true;
        }
        return false;
    }

    public void detectHighValueTransaction(Store store, Payment payment) {

        String redisKey = "store:operation:startTime:" + store.getId();
        Object avgObj = stringRedisTemplate.opsForHash().get(redisKey, "avgPaymentAmountPrevMonth");


        // 전월 평균이 0이면 비교 불가하므로 스킵
        if (avgObj != null) {
            double avgAmount = Double.parseDouble(avgObj.toString());
            double currentAmount = payment.getAmount();

            if (avgAmount > 0 && currentAmount >= avgAmount * 10) {
                AlertEvent event = AlertEvent.builder()
                        .alertUuid(UUID.randomUUID().toString().substring(0, 20))
                        .storeId(store.getId())
                        .storeName(store.getName())
                        .alertType(AlertType.HIGH_AMOUNT_SPIKE)
                        .description(String.format(
                                "결제 금액 %,d원이 전월 평균(%,.0f원)의 10배이상을 초과했습니다.",
                                (long) currentAmount, avgAmount))
                        .detectedAt(LocalDateTime.now())
                        .paymentId(payment.getId())
                        .build();

                publisher.publishEvent(event);
                log.info("[AlertEvent 발행 - 고액결제 급증] storeId={}, current={}, avgPrevMonth={}",
                        store.getId(), currentAmount, avgAmount);
            }
        }
    }

    private boolean shouldUpdateDb(LocalDateTime approveTime, Object startTimeObj){
        if (startTimeObj == null){
            return true;
        }
        LocalDateTime startTime = LocalDateTime.parse(startTimeObj.toString());
        return approveTime.isBefore(startTime);
    }


}
