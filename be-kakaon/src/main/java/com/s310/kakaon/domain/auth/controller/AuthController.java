package com.s310.kakaon.domain.auth.controller;

import com.s310.kakaon.domain.auth.dto.RefreshTokenRequestDto;
import com.s310.kakaon.domain.auth.service.AuthService;
import com.s310.kakaon.global.dto.ApiResponse;
import com.s310.kakaon.global.jwt.TokenResponseDto;
import com.s310.kakaon.global.util.CookieUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@Tag(name = "Auth", description = "JWT / OAuth2 인증 및 토큰 갱신 관련 API")
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CookieUtil cookieUtil;
    private final AuthService authService;

    /** 로그아웃 */
    @Operation(
            summary = "로그아웃 (토큰 블랙리스트 처리)",
            description = """
                    Refresh Token을 Redis 블랙리스트에 등록하고,
                    클라이언트의 Refresh Token 쿠키를 삭제합니다.
                    """
    )
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            HttpServletRequest httpRequest, HttpServletResponse httpResponse
    ) {
        // refresh token Redis-blacklist에 저장
        authService.logout(httpRequest);

        // refreshtoken 쿠키 삭제
        cookieUtil.deleteRefreshTokenCookie(httpResponse);

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "로그아웃 성공", null, httpRequest.getRequestURI()));
    }

    @Operation(
            summary = "Access / Refresh 토큰 재발급",
            description = """
                    쿠키에 저장된 Refresh Token을 검증 후 새로운 Access / Refresh Token을 발급합니다.
                    새 Refresh Token은 쿠키에 다시 저장됩니다.
                    """
    )
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponseDto>> refresh(
            HttpServletRequest httpRequest, HttpServletResponse httpResponse
    ) {

        // 쿠키에 있는 RefreshToken 읽기
        String cookie = cookieUtil.getRefreshTokenFromCookie(httpRequest)
                .orElseThrow(() -> new RuntimeException("Refresh token cookie not found"));

        // RefreshTokenRequestDto 생성
        RefreshTokenRequestDto dto =  new RefreshTokenRequestDto(cookie);
        TokenResponseDto tokens = authService.refreshToken(dto);

        // 새로운 RefreshToken 쿠키에 저장
        cookieUtil.addRefreshTokenCookie(httpResponse, tokens.getRefreshToken());

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "토큰 갱신 성공", tokens, httpRequest.getRequestURI()));
    }
}

