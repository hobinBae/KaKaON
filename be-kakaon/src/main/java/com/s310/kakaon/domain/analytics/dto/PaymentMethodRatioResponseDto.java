package com.s310.kakaon.domain.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodRatioResponseDto {

    private Long storeId;
    private String periodType;
    private String startDate;
    private String endDate;

    // 결제수단별 합계
    private Long cardTotal;
    private Long cashTotal;
    private Long kakaopayTotal;
    private Long transferTotal;

    // 배달 가게 매출 합계
    private Long storeTotal;
    private Long deliveryTotal;

    // 전체 매출 총합
    private Long totalAmount;

}
