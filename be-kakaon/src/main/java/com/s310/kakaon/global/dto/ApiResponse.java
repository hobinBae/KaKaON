package com.s310.kakaon.global.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private int status;
    private String message;
    private T data;
    private String timestamp;
    private String path;

    // 성공 응답을 위한 정적 팩토리 메서드를 추가했음
    public static <T> ApiResponse<T> onSuccess(T data) {
        return new ApiResponse<>(
                true,
                HttpStatus.OK.value(),
                "요청에 성공했습니다.",
                data,
                LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME),
                null // 컨트롤러에서 HttpServletRequest를 받아 채워야 함
        );
    }

    // 1) 생성 시각과 경로를 자동 채워 주는 편의 팩토리 메서드
    public static <T> ApiResponse<T> of(
            HttpStatus status,
            String message,
            T data,
            String requestPath
    ) {
        return new ApiResponse<>(
                true,
                status.value(),
                message,
                data,
                LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME),
                requestPath
        );
    }
}
