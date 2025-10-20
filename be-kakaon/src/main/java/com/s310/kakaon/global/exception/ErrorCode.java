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

    // book 관련 에러
    BOOK_CATEGORY_NOT_FOUND("BOOK_CATEGORY_NOT_FOUND", HttpStatus.NOT_FOUND, "카테고리를 찾을 수 없습니다."),
    BOOK_NOT_FOUND("BOOK_NOT_FOUND", HttpStatus.NOT_FOUND, "책을 찾을 수 없습니다."),
    EPISODE_NOT_FOUND("EPISODE_NOT_FOUND", HttpStatus.NOT_FOUND, "에피소드를 찾을 수 없습니다."),
    FORBIDDEN("FORBIDDEN", HttpStatus.FORBIDDEN, "권한이 없습니다."),
    INVALID_INPUT_VALUE("INVALID_INPUT_VALUE", HttpStatus.BAD_REQUEST, "잘못된 세션 아이디 입니다."),
    GROUP_NOT_FOUND("GROUP_NOT_FOUND", HttpStatus.NOT_FOUND, "그룹을 찾을 수 없습니다."),
    GROUP_ACCESS_DENIED("GROUP_ACCESS_DENIED", HttpStatus.UNAUTHORIZED, "그룹 접근 권한이 없습니다."),
    GROUP_LEADER_ROLE_CANNOT_BE_CHANGED("GROUP_LEADER_ROLE_CANNOT_BE_CHANGED", HttpStatus.FORBIDDEN, "그룹 리더의 역할은 변경할 수 없습니다."),
    CANNOT_SKIP_LAST_QUESTION("CANNOT_SKIP_LAST_QUESTION", HttpStatus.BAD_REQUEST, "다음 질문이 없습니다."),
    GROUP_MEMBER_ALREADY_EXISTS("GROUP_MEMBER_ALREADY_EXISTS", HttpStatus.CONFLICT, "이미 존재하는 그룹원입니다."),
    INVITE_ALREADY_EXISTS("INVITE_ALREADY_EXISTS", HttpStatus.CONFLICT, "이미 대기 중인 초대가 있습니다."),

    // GroupBook 관련 에러
    GROUP_BOOK_NOT_FOUND("GROUP_BOOK_NOT_FOUND", HttpStatus.NOT_FOUND, "그룹 책을 찾을 수 없습니다."),
    GROUP_BOOK_ALREADY_DELETED("GROUP_BOOK_ALREADY_DELETED", HttpStatus.GONE,"이미 삭제된 그룹 책입니다."),
    SESSION_NOT_FOUND("SESSION_NOT_FOUND", HttpStatus.NOT_FOUND, "대화 세션을 찾을 수 없습니다."),
    INVALID_REQUEST("INVALID_REQUEST",HttpStatus.BAD_REQUEST, "다음 질문이 없습니다."),

    // CommunityBook 관련 에러
    COMMUNITY_BOOK_NOT_FOUND("COMMUNITY_BOOK_NOT_FOUND", HttpStatus.NOT_FOUND, "커뮤니티 책을 찾을 수 없습니다."),
    COMMUNITY_BOOK_ALREADY_DELETED("COMMUNITY_BOOK_ALREADY_DELETED", HttpStatus.GONE,"이미 삭제된 커뮤니티 책입니다."),

    COMMENT_NOT_FOUND("COMMENT_NOT_FOUND", HttpStatus.NOT_FOUND, "댓글을 찾을 수 없습니다."),
    COMMENT_ACCESS_DENIED("COMMENT_ACCESS_DENIED", HttpStatus.FORBIDDEN,"댓글에 대한 권한이 없습니다"),

    BOOK_HAS_NO_EPISODES("BOOK_HAS_NO_EPISODES", HttpStatus.BAD_REQUEST, "에피소드가 없는 책은 커뮤니티로 보낼 수 없습니다."),
    BOOK_NOT_COMPLETED("BOOK_NOT_COMPLETED", HttpStatus.BAD_REQUEST, "완료되지 않은 책은 커뮤니티로 내보낼 수 없습니다"),

    RATING_ALREADY_EXISTS("RATING_ALREADY_EXISTS", HttpStatus.CONFLICT, "이미 평점을 등록한 책입니다."),
    
    // 이미지 관련 에러
    IMAGE_NOT_FOUND("IMAGE_NOT_FOUND", HttpStatus.NOT_FOUND, "이미지를 찾을 수 없습니다.");

    //
    // 필요한 에러 코드 계속 추가


    private final String code;
    private final HttpStatus status;
    private final String message;
}
