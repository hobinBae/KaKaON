package com.s310.kakaon.domain.fraud.detector;

import com.s310.kakaon.domain.alert.dto.AlertEvent;
import com.s310.kakaon.domain.alert.entity.AlertType;
import com.s310.kakaon.domain.payment.dto.PaymentEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class DuplicatePaymentDetector implements FraudDetector {

    // Key: "storeId-paymentMethod-amount", Value: List<PaymentEventDto>
    // TODO: Redis로 수정하기
    private final Map<String, List<PaymentEventDto>> recentPayments = new ConcurrentHashMap<>();

    private static final int TIME_WINDOW_MINUTES = 5;      // 5분
    private static final int DUPLICATE_COUNT_THRESHOLD = 2; // 2번 이상

    @Override
    public List<AlertEvent> detect(PaymentEventDto event) {
        String key = generateKey(event);

        List<PaymentEventDto> recentList = recentPayments
                .computeIfAbsent(key, k -> new ArrayList<>());

        LocalDateTime windowStart = event.getApprovedAt().minusMinutes(TIME_WINDOW_MINUTES);
        recentList.removeIf(p -> p.getApprovedAt().isBefore(windowStart));

        // 현재 이벤트 추가
        recentList.add(event);

        if (recentList.size() < DUPLICATE_COUNT_THRESHOLD) {
            return Collections.emptyList();
        }

        // 승인시각 기준 정렬로 일관성 보장
        recentList.sort(Comparator.comparing(PaymentEventDto::getApprovedAt));

        List<Long> paymentIdsInWindow = recentList.stream()
                .map(PaymentEventDto::getPaymentId)
                .toList();

        log.info("[DETECTOR] storeId={}, key={}, windowCount={}, paymentIdsInWindow={}",
                event.getStoreId(), key, recentList.size(), paymentIdsInWindow);

        List<String> authNosInWindow = recentList.stream()
                .map(PaymentEventDto::getAuthorizationNo)
                .toList();

        String description = String.format(
                "[중복 거래] 동일한 금액(%s원)과 결제수단(%s)으로 %d분 내 %d회 결제 발생\n" +
                        "- 가맹점: %s (매장ID: %s)\n" +
                        "- 첫 결제 시각: %s\n" +
                        "- 마지막 결제 시각: %s\n" +
                        "- 관련 결제 ID: %s\n" +
                        "- 관련 결제 승인번호: %s",
                event.getAmount(),
                event.getPaymentMethod(),
                TIME_WINDOW_MINUTES,
                recentList.size(),
                event.getStoreName(),
                event.getStoreId(),
                recentList.get(0).getApprovedAt(),
                recentList.get(recentList.size()-1).getApprovedAt(),
                paymentIdsInWindow, authNosInWindow
        );

        LocalDateTime detectedAt = LocalDateTime.now();

        // groupId는 key가 아니라 generateGroupId 결과 사용
        String groupId = generateGroupId(key, recentList);

        // AlertEvent "1개만" 생성
        AlertEvent alertEvent = AlertEvent.builder()
                .groupId(groupId)
                .storeId(event.getStoreId())
                .storeName(event.getStoreName())
                .alertType(getAlertType())
                .description(description)
                .detectedAt(detectedAt)
                .paymentId(event.getPaymentId())            // 트리거 결제(참고용)
                .relatedPaymentIds(paymentIdsInWindow)      // 윈도우 내 전체 결제
                .build();

        return List.of(alertEvent);
    }


    @Override
    public AlertType getAlertType() {
        return AlertType.DUPLICATE_PAYMENT;
    }

    /**
     * 중복 체크용 키 생성: "가맹점ID-결제수단-금액"
     */
    private String generateKey(PaymentEventDto event) {
        return String.format("%d-%s-%s",
                event.getStoreId(),
                event.getPaymentMethod(),
                event.getAmount().toString()
        );
    }

    /**
     * 같은 이상거래 케이스를 식별하기 위한 groupId 생성
     */
    private String generateGroupId(String key, List<PaymentEventDto> payments) {
        // 첫 번째 결제의 paymentId를 기준으로 groupId 생성
        return String.format("DUP-%s-%d", key, payments.get(0).getPaymentId());
    }

    @Override
    public void cleanup() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(TIME_WINDOW_MINUTES + 5);
        recentPayments.values().forEach(list ->
                list.removeIf(p -> p.getApprovedAt().isBefore(threshold))
        );
    }
}