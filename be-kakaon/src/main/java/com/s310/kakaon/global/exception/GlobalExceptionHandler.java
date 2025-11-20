package com.s310.kakaon.global.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.async.AsyncRequestNotUsableException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
@RequiredArgsConstructor
@Order(Ordered.LOWEST_PRECEDENCE)
@Slf4j
public class GlobalExceptionHandler {

    /**
     * SSE 응답이 이미 닫힌 뒤 재디스패치되는 케이스: 바디를 쓰지 말고 조용히 종료
     */
    @ExceptionHandler(AsyncRequestNotUsableException.class)
    public void handleAsyncRequestNotUsable(AsyncRequestNotUsableException ex) {
        log.debug("AsyncRequestNotUsableException during SSE dispatch: {}", ex.getMessage());
    }

    /**
     * 커스텀 예외 처리
     */
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<?> handleApiException(
            ApiException ex,
            HttpServletRequest request
    ) {
        if (isSseRequest(request)) {
            String payload = "event:error\n" +
                    "data:" + escapeForOneLine(ex.getMessage()) + "\n\n";
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_EVENT_STREAM)
                    .body(payload);
        }
        ErrorCode ec = ex.getErrorCode();
        ErrorResponse body = ErrorResponse.of(ec, request.getRequestURI(), null);
        return ResponseEntity.status(ec.getStatus()).body(body);
    }

    /**
     * @Valid 검증 실패 처리
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {
        List<ErrorResponse.FieldError> details = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ErrorResponse.FieldError(
                        fe.getField(),
                        String.valueOf(fe.getRejectedValue()),
                        fe.getDefaultMessage()
                ))
                .collect(Collectors.toList());

        ErrorResponse body = ErrorResponse.builder()
                .success(false)
                .errorCode(ErrorCode.VALIDATION_FAILED.getCode())
                .message(ErrorCode.VALIDATION_FAILED.getMessage())
                .details(details)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME))
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.badRequest().body(body);
    }

    /**
     * 예기치 못한 오류 처리
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(
            Exception ex,
            HttpServletRequest request
    ) {
        log.error("Unhandled exception", ex);

        if (isSseRequest(request)) {
            // SSE는 JSON 객체가 아니라 문자열 이벤트로 반환
            String payload = "event:error\n" +
                    "data:" + escapeForOneLine(ex.getMessage()) + "\n\n";
            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_EVENT_STREAM)
                    .body(payload);
        }

        ErrorCode ec = ErrorCode.INTERNAL_SERVER_ERROR;
        ErrorResponse body = ErrorResponse.of(ec, request.getRequestURI(), null);
        return ResponseEntity.status(ec.getStatus()).body(body);
    }

    /**
     * SSE 요청 여부 식별
     */
    private boolean isSseRequest(HttpServletRequest req) {
        String accept = req.getHeader(HttpHeaders.ACCEPT);
        String contentType = req.getHeader(HttpHeaders.CONTENT_TYPE);
        return (accept != null && accept.contains(MediaType.TEXT_EVENT_STREAM_VALUE))
                || (contentType != null && contentType.contains(MediaType.TEXT_EVENT_STREAM_VALUE))
                || req.getRequestURI().contains("/stream");
    }

    /**
     * SSE 한 줄 데이터 안전 처리
     */
    private String escapeForOneLine(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("\n", " ").replace("\r", " ");
    }
}
