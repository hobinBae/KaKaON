package com.s310.kakaon.domain.auth.service;

import com.s310.kakaon.domain.auth.dto.RefreshTokenRequestDto;
import com.s310.kakaon.global.jwt.TokenResponseDto;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {

    TokenResponseDto refreshToken(RefreshTokenRequestDto dto);

    void logout(HttpServletRequest httpRequest);
}
