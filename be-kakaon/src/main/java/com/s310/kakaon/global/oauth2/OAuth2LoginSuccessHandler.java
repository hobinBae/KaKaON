package com.s310.kakaon.global.oauth2;

import com.s310.kakaon.domain.member.entity.Role;
import com.s310.kakaon.global.jwt.JwtTokenProvider;
import com.s310.kakaon.global.jwt.TokenResponseDto;
import com.s310.kakaon.global.util.CookieUtil;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${oauth2.redirect-uri}")
    private String redirectUri;

    private final CookieUtil cookieUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        
        // OAuth2 인증 정보에서 사용자 정보 추출
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        String kakaoId = oAuth2User.getName();
        Role role = oAuth2User.getRole();
        
        // JWT 토큰 생성
        TokenResponseDto tokenResponse = jwtTokenProvider.createTokenResponse(kakaoId, role.name());
        
        // refreshToken 쿠키 저장
        cookieUtil.addRefreshTokenCookie(response, tokenResponse.getRefreshToken());

        // 프론트엔드로 리다이렉트 (토큰을 쿼리 파라미터로 전달)
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("accessToken", tokenResponse.getAccessToken())
                .build().toUriString();
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
