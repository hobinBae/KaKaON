package com.s310.kakaon.domain.alert.dto;

import com.s310.kakaon.domain.alert.entity.AlertType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class AlertEvent {
    private  String alertUuid;      // UUID (이벤트 식별용)
    private  Long storeId;          // 가맹점 ID
    private  String storeName;      // 가맹점 이름
    private  AlertType alertType;   // 알림 종류 (ALE-006-1 등)
    private  String description;    // 알림 내용 (예: "전주 대비 취소율 25% 증가")
    private  LocalDateTime detectedAt; // 탐지 시각

    private Long paymentId;

    private String groupId;
    private List<Long> relatedPaymentIds;
}
