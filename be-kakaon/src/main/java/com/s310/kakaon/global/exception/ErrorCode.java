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
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다.")

    ;
    //
    // 필요한 에러 코드 계속 추가


    private final String code;
    private final HttpStatus status;
    private final String message;
}
