package com.s310.kakaon.domain.payment.service;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.order.repository.OrderRepository;
import com.s310.kakaon.domain.payment.dto.PaymentCreateRequestDto;
import com.s310.kakaon.domain.payment.dto.PaymentResponseDto;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.payment.mapper.PaymentMapper;
import com.s310.kakaon.domain.payment.repository.PaymentRepository;
import com.s310.kakaon.domain.store.dto.StoreResponseDto;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.ManyToAny;
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
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService{

    private final MemberRepository memberRepository;
    private final StoreRepository storeRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final OrderRepository orderRepository;

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

        return paymentMapper.fromEntity(payment);
    }

    @Override
    public void uploadPaymentsFromCsv(MultipartFile file, Long storeId, Long memberId) {
        
    }


    @Override
    @Transactional
    public void deletePayment(Long memberId, Long id) {
       memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));

        payment.cancel();

    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponseDto> getPaymentsByStore(Long memberId, Long storeId) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        validateStoreOwner(store, member);

        List<Payment> payments = paymentRepository.findByStore(store);

        return payments.stream()
                .map(paymentMapper::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDto getPaymentById(Long memberId, Long id) {

        memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));

        return paymentMapper.fromEntity (payment);
    }

    public String generateAuthorizationNo(){
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yymmdd"));
        int randomPart = new SecureRandom().nextInt(100_000);
        return datePart + String.format("%05d", randomPart);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] downloadPaymentsCsv(Long memberId, Long storeId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        validateStoreOwner(store, member);

        List<Payment> payments = paymentRepository.findByStore(store);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter osw = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             PrintWriter writer = new PrintWriter(osw)) {

            // UTF-8 BOM 추가 (엑셀에서 한글 깨짐 방지)
            baos.write(0xEF);
            baos.write(0xBB);
            baos.write(0xBF);

            // CSV 헤더
            writer.println("결제ID,매장명,주문ID,승인번호,금액,결제수단,상태,배달여부,승인일시,취소일시,생성일시,수정일시");

            // CSV 데이터
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            for (Payment payment : payments) {
                writer.printf("%d,%s,%d,%s,%d,%s,%s,%s,%s,%s,%s,%s%n",
                        payment.getId(),
                        escapeCsvField(store.getName()),
                        payment.getOrder().getOrderId(),
                        escapeCsvField(payment.getAuthorizationNo()),
                        payment.getAmount(),
                        payment.getPaymentMethod().name(),
                        payment.getStatus().name(),
                        payment.getDelivery() ? "배달" : "포장",
                        payment.getApprovedAt().format(formatter),
                        payment.getCanceledAt() != null ? payment.getCanceledAt().format(formatter) : "",
                        payment.getCreatedDateTime().format(formatter),
                        payment.getLastModifiedDateTime().format(formatter)
                );
            }

            writer.flush();
            return baos.toByteArray();

        } catch (IOException e) {
            log.error("CSV 생성 중 오류 발생", e);
            throw new ApiException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
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
