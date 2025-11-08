package com.s310.kakaon.domain.alert.dto;

import com.s310.kakaon.domain.alert.entity.AlertType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Builder
public class AlertResponseDto {

    private Long id;
    private String alertUuid; // 이상거래 uuid(나중에 알림 아이디로 바꿀 수도..)
    private LocalDateTime detectedAt; // 탐지(발생)시간
    private AlertType alertType; // 이상거래 유형
    private Boolean checked; // 확인 상태

}
