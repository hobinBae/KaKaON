package com.s310.kakaon.domain.fraud.detector;

import com.s310.kakaon.domain.alert.dto.AlertEvent;
import com.s310.kakaon.domain.alert.entity.AlertType;
import com.s310.kakaon.domain.payment.dto.PaymentEventDto;

import java.util.List;
import java.util.Optional;

/**
 * 이상거래 탐지 룰 인터페이스
 */
public interface FraudDetector {
    /**
     * 이상거래 탐지 실행
     * @param event 현재 결제 이벤트
     * @return 이상거래가 탐지되면 Alert 반환, 아니면 Empty
     */
    List<AlertEvent> detect(PaymentEventDto event);

    /**
     * 탐지 룰 타입 반환
     */
    AlertType getAlertType();

    /**
     * 캐시 정리
     */
    default void cleanup() {}
}