package com.s310.kakaon.global.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {

    USER_NOT_FOUND("USER_NOT_FOUND", HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    INVALID_PASSWORD("INVALID_PASSWORD", HttpStatus.UNAUTHORIZED, "비밀번호가 올바르지 않습니다."),
    INVALID_TOKEN("INVALID_TOKEN", HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    TOKEN_EXPIRED("TOKEN_EXPIRED", HttpStatus.UNAUTHORIZED, "토큰이 만료되었습니다."),
    VALIDATION_FAILED("VALIDATION_FAILED", HttpStatus.BAD_REQUEST, "입력값 검증에 실패했습니다."),
    INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR, "서버 오류가 발생했습니다."),

    // S3 관련 에러
    INVALID_FILE_FORMAT("INVALID_FILE_FORMAT", HttpStatus.BAD_REQUEST, "파일 형식이 유효하지 않습니다."),
    FILE_SIZE_EXCEEDED("FILE_SIZE_EXCEEDED", HttpStatus.BAD_REQUEST, "파일 크기 제한을 초과했습니다."),
    S3_UPLOAD_ERROR("S3_UPLOAD_ERROR", HttpStatus.INTERNAL_SERVER_ERROR, "S3 파일 업로드에 실패했습니다."),
    S3_DELETE_ERROR("S3_DELETE_ERROR", HttpStatus.INTERNAL_SERVER_ERROR, "S3 파일 삭제에 실패했습니다."),
    INVALID_IMAGE_URL("INVALID_IMAGE_URL", HttpStatus.BAD_REQUEST, "잘못된 이미지 URL입니다."),

    EMAIL_ALREADY_EXISTS("EMAIL_ALREADY_EXISTS", HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    NICKNAME_ALREADY_EXISTS("NICKNAME_ALREADY_EXISTS", HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다."),

    // 이미지 관련 에러
    IMAGE_NOT_FOUND("IMAGE_NOT_FOUND", HttpStatus.NOT_FOUND, "이미지를 찾을 수 없습니다."),

    BUSINESS_NUMBER_ALREADY_EXISTS("BUSINESS_NUMBER_ALREADY_EXISTS", HttpStatus.CONFLICT,"이미 등록된 사업자번호입니다.");

    //
    // 필요한 에러 코드 계속 추가


    private final String code;
    private final HttpStatus status;
    private final String message;
}
