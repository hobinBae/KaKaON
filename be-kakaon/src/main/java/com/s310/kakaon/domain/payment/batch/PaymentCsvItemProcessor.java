package com.s310.kakaon.domain.payment.batch;

import com.s310.kakaon.domain.payment.dto.PaymentCsvDto;
import com.s310.kakaon.domain.payment.dto.PaymentMethod;
import com.s310.kakaon.domain.payment.dto.PaymentStatus;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.payment.repository.PaymentRepository;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * CSV에서 읽은 PaymentCsvDto를 검증하고 Payment 엔티티로 변환하는 Processor
 */
@Component
@StepScope
@RequiredArgsConstructor
@Slf4j
public class PaymentCsvItemProcessor implements ItemProcessor<PaymentCsvDto, Payment> {

    private final StoreRepository storeRepository;
    private final PaymentRepository paymentRepository;

    @Value("#{jobParameters['storeId']}")
    private Long storeId;

    @Override
    public Payment process(PaymentCsvDto item) throws Exception {
        try {
            // 1. Store 조회
            Store store = storeRepository.findById(storeId)
                    .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

            // 2. 매장명 검증
            if (!item.getStoreName().equals(store.getName())) {
                log.warn("매장명 불일치 스킵: CSV={}, 실제={}", item.getStoreName(), store.getName());
                return null; // null 반환 시 해당 아이템은 writer로 전달되지 않음
            }

            // 3. 승인번호 중복 체크
            if (paymentRepository.existsByAuthorizationNo(item.getAuthorizationNo())) {
                log.warn("승인번호 {} 중복 스킵", item.getAuthorizationNo());
                return null;
            }

            // 4. Enum 변환
            PaymentMethod paymentMethod = PaymentMethod.valueOf(item.getPaymentMethod());
            PaymentStatus status = PaymentStatus.valueOf(item.getStatus());
            Boolean isDelivery = "배달".equals(item.getDeliveryType());

            // 5. Payment 엔티티 생성
            return Payment.builder()
                    .store(store)
                    .order(null) // CSV 업로드는 주문 정보 없음
                    .authorizationNo(item.getAuthorizationNo())
                    .amount(item.getAmount())
                    .paymentMethod(paymentMethod)
                    .status(status)
                    .approvedAt(item.getApprovedAt())
                    .canceledAt(item.getCanceledAt())
                    .delivery(isDelivery)
                    .paymentUuid("CSV_UPLOAD_" + item.getAuthorizationNo())
                    .build();

        } catch (IllegalArgumentException e) {
            log.error("Enum 변환 오류 (승인번호: {}): {}", item.getAuthorizationNo(), e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("처리 중 오류 (승인번호: {}): {}", item.getAuthorizationNo(), e.getMessage(), e);
            throw e; // 예외를 던지면 skip 정책에 따라 처리됨
        }
    }
}
