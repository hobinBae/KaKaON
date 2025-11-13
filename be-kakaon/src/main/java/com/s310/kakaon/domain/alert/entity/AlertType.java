package com.s310.kakaon.domain.alert.entity;

public enum AlertType {

    SAME_PAYMENT_METHOD("동일 결제수단"),
    OUT_OF_BUSINESS_HOUR("영업시간 외 거래"),
    DUPLICATE_PAYMENT("반복결제"),
    HIGH_AMOUNT_SPIKE("고액결제 급증"),
    TRANSACTION_FREQUENCY_SPIKE("거래빈도 급증"),
    CANCEL_RATE_SPIKE("취소율 급증");

    private final String description;

    AlertType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

}
