package com.s310.kakaon.domain.payment.service;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.order.repository.OrderRepository;
import com.s310.kakaon.domain.payment.dto.CancelRateAnomalyDto;
import com.s310.kakaon.domain.payment.dto.PaymentCreateRequestDto;
import com.s310.kakaon.domain.payment.dto.PaymentMethod;
import com.s310.kakaon.domain.payment.dto.PaymentResponseDto;
import com.s310.kakaon.domain.payment.dto.PaymentSearchRequestDto;
import com.s310.kakaon.domain.payment.dto.PaymentStatus;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.payment.entity.PaymentCancel;
import com.s310.kakaon.domain.payment.mapper.PaymentMapper;
import com.s310.kakaon.domain.payment.repository.PaymentCancelRepository;
import com.s310.kakaon.domain.payment.repository.PaymentRepository;
import com.s310.kakaon.domain.store.dto.StoreResponseDto;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.dto.PageResponse;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.ManyToAny;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
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

        Payment payment = paymentMapper.toEntity(store, order, authorizationNo ,request);

        paymentRepository.save(payment);

        // ✅ Redis 통계 즉시 반영
//        salesCacheService.updatePaymentStats(storeId, payment.getAmount(), payment.getApprovedAt());

        return paymentMapper.fromEntity(payment);
    }

    @Override
    @Transactional
    public void uploadPaymentsFromCsv(MultipartFile file, Long storeId, Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        validateStoreOwner(store, member);

        try {
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);

            // BOM 제거 (있는 경우)
            if (content.startsWith("\uFEFF")) {
                content = content.substring(1);
            }

            String[] lines = content.split("\n");

            if (lines.length < 2) {
                throw new ApiException(ErrorCode.INVALID_CSV_FORMAT);
            }

            // 첫 번째 라인은 헤더이므로 건너뛰기
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            int successCount = 0;
            int failCount = 0;

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
                    // 결제ID(0), 매장명(1), 주문ID(2), 승인번호(3), 금액(4), 결제수단(5), 상태(6), 배달여부(7), 승인일시(8), 취소일시(9)
                    Long orderId = Long.parseLong(fields[2].trim());
                    String authorizationNo = fields[3].trim();
                    Integer amount = Integer.parseInt(fields[4].trim());
                    PaymentMethod paymentMethod = PaymentMethod.valueOf(fields[5].trim());
                    PaymentStatus status = PaymentStatus.valueOf(fields[6].trim());
                    Boolean isDelivery = "배달".equals(fields[7].trim());
                    LocalDateTime approvedAt = LocalDateTime.parse(fields[8].trim(), formatter);
                    LocalDateTime canceledAt = null;
                    if (fields.length > 9 && !fields[9].trim().isEmpty()) {
                        canceledAt = LocalDateTime.parse(fields[9].trim(), formatter);
                    }

                    // Order 찾기
                    Orders order = orderRepository.findById(orderId)
                            .orElseThrow(() -> new ApiException(ErrorCode.ORDER_NOT_FOUND));

                    // Order가 해당 Store에 속하는지 확인
                    if (!order.getStore().getId().equals(storeId)) {
                        log.warn("라인 {} 스킵: 주문 {}가 매장 {}에 속하지 않음", i + 1, orderId, storeId);
                        failCount++;
                        continue;
                    }

                    // 승인번호 중복 체크
                    if (paymentRepository.existsByAuthorizationNo(authorizationNo)) {
                        log.warn("라인 {} 스킵: 승인번호 {} 중복", i + 1, authorizationNo);
                        failCount++;
                        continue;
                    }

                    // Payment 생성
                    Payment payment = Payment.builder()
                            .store(store)
                            .order(order)
                            .authorizationNo(authorizationNo)
                            .amount(amount)
                            .paymentMethod(paymentMethod)
                            .status(status)
                            .approvedAt(approvedAt)
                            .canceledAt(canceledAt)
                            .delivery(isDelivery)
                            .build();

                    paymentRepository.save(payment);
                    successCount++;

                } catch (Exception e) {
                    log.error("라인 {} 처리 중 오류: {}", i + 1, e.getMessage(), e);
                    failCount++;
                }
            }

            log.info("CSV 업로드 완료: 성공 {}건, 실패 {}건", successCount, failCount);

            if (successCount == 0 && failCount > 0) {
                throw new ApiException(ErrorCode.CSV_UPLOAD_FAILED);
            }

        } catch (IOException e) {
            log.error("CSV 파일 읽기 오류", e);
            throw new ApiException(ErrorCode.FILE_READ_ERROR);
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

        payment.cancel();
//        salesCacheService.updateCancelStats(storeId, payment.getAmount(), LocalDateTime.now());

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
            writer.println("결제ID,매장명,주문ID,승인번호,금액,결제수단,상태,배달여부,승인일시,취소일시");

            // CSV 데이터
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            for (PaymentResponseDto payment : paymentDtos) {
                writer.printf("%d,%s,%d,%s,%d,%s,%s,%s,%s,%s%n",
                        payment.getPaymentId(),
                        escapeCsvField(store.getName()),
                        payment.getOrderId(),
                        escapeCsvField(payment.getAuthorizationCode()),
                        payment.getAmount(),
                        payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : "",
                        payment.getStatus() != null ? payment.getStatus().name() : "",
                        payment.getDelivery() != null && payment.getDelivery() ? "배달" : "포장",
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
}
