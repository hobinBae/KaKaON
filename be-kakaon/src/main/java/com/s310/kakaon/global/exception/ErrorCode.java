package com.s310.kakaon.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    // 사용자 관련
    MEMBER_NOT_FOUND("MEMBER_NOT_FOUND", HttpStatus.NOT_FOUND, "회원을 찾을 수 없습니다."),
    MEMBER_DELETED("MEMBER_DELETED", HttpStatus.FORBIDDEN, "탈퇴한 회원입니다."),

    // 인증/인가 관련
    INVALID_PASSWORD("INVALID_PASSWORD", HttpStatus.UNAUTHORIZED, "비밀번호가 올바르지 않습니다."),
    INVALID_TOKEN("INVALID_TOKEN", HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    TOKEN_EXPIRED("TOKEN_EXPIRED", HttpStatus.UNAUTHORIZED, "토큰이 만료되었습니다."),
    ACCESS_DENIED("ACCESS_DENIED", HttpStatus.FORBIDDEN, "권한이 없습니다."),
    INVALID_REFRESH_TOKEN("INVALID_REFRESH_TOKEN", HttpStatus.UNAUTHORIZED, "유효하지 않은 리프레시 토큰입니다."),

    // 공통
    VALIDATION_FAILED("VALIDATION_FAILED", HttpStatus.BAD_REQUEST, "입력값 검증에 실패했습니다."),
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다."),

    EMAIL_ALREADY_EXISTS("EMAIL_ALREADY_EXISTS", HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    NICKNAME_ALREADY_EXISTS("NICKNAME_ALREADY_EXISTS", HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다."),

    // 이미지 관련 에러
    IMAGE_NOT_FOUND("IMAGE_NOT_FOUND", HttpStatus.NOT_FOUND, "이미지를 찾을 수 없습니다."),

    STORE_NOT_FOUND("STORE_NOT_FOUND", HttpStatus.NOT_FOUND, "가맹점을 찾을 수 없습니다."),
    BUSINESS_NUMBER_ALREADY_EXISTS("BUSINESS_NUMBER_ALREADY_EXISTS", HttpStatus.CONFLICT,"이미 등록된 사업자번호입니다."),

    ALERT_RECIPIENT_NOT_FOUND("ALERT_RECIPIENT_NOT_FOUND", HttpStatus.NOT_FOUND, "알림 수신자를 찾을 수 없습니다."),

    PAYMENT_NOT_FOUND("PAYMENT_NOT_FOUND", HttpStatus.NOT_FOUND, "결제 내역을 찾을 수 없습니다."),

    ORDER_NOT_FOUND("ORDER_NOT_FOUND", HttpStatus.NOT_FOUND, "주문 내역을 찾을 수 없습니다."),

    ORDER_ALREADY_CANCELED("ORDER_ALREADY_CANCELED", HttpStatus.BAD_REQUEST, "이미 취소된 주문입니다."),

    FORBIDDEN_ACCESS("FORBIDDEN_ACCESS", HttpStatus.FORBIDDEN, "회원 정보와 사업자 정보가 일치하지 않습니다."),

    MENU_NOT_FOUND("MENU_NOT_FOUND", HttpStatus.NOT_FOUND, "메뉴를 찾을 수 없습니다."),

    PAYMENT_CANCEL_NOT_FOUND("PAYMENT_CANCEL_NOT_FOUND", HttpStatus.NOT_FOUND, "결제 취소 내역을 찾을 수 없습니다."),

    PAYMENT_INFO_NOT_FOUND("PAYMENT_INFO_NOT_FOUND", HttpStatus.NOT_FOUND, "등록되지 않은 카드 번호/카카오페이 바코드 번호입니다."),
    PAYMENT_INFO_ALREADY_EXISTS("PAYMENT_INFO_ALREADY_EXISTS", HttpStatus.NOT_FOUND, "이미 등록된 결제 수단입니다."),

    // CSV 업로드 관련
    INVALID_CSV_FORMAT("INVALID_CSV_FORMAT", HttpStatus.BAD_REQUEST, "CSV 파일 형식이 올바르지 않습니다."),
    CSV_UPLOAD_FAILED("CSV_UPLOAD_FAILED", HttpStatus.BAD_REQUEST, "CSV 업로드에 실패했습니다."),
    FILE_READ_ERROR("FILE_READ_ERROR", HttpStatus.INTERNAL_SERVER_ERROR, "파일을 읽는 중 오류가 발생했습니다."),

    ALERT_NOT_FOUND("ALERT_NOT_FOUND", HttpStatus.NOT_FOUND, "이상 거래 알림을 찾을 수 없습니다."),

    INVALID_PERIOD("INVALID_PERIOD", HttpStatus.BAD_REQUEST, "잘못된 날짜 설정입니다."),
    PERIOD_NOT_FOUND("PERIOD_NOT_FOUND", HttpStatus.NOT_FOUND, "조회 기간을 찾을 수 없습니다.")
            ;

    //
    // 필요한 에러 코드 계속 추가


    private final String code;
    private final HttpStatus status;
    private final String message;
}
