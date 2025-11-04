package com.s310.kakaon.domain.auth.controller;

import com.s310.kakaon.domain.auth.dto.RefreshTokenRequestDto;
import com.s310.kakaon.domain.auth.service.AuthService;
import com.s310.kakaon.global.dto.ApiResponse;
import com.s310.kakaon.global.jwt.TokenResponseDto;
import com.s310.kakaon.global.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final CookieUtil cookieUtil;
    private final AuthService authService;

    /** 로그아웃 */
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

