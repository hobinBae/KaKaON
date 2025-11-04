package com.s310.kakaon.domain.auth.service;

import com.s310.kakaon.domain.auth.dto.RefreshTokenRequestDto;
import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.entity.Provider;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import com.s310.kakaon.global.jwt.JwtTokenProvider;
import com.s310.kakaon.global.jwt.TokenResponseDto;
import com.s310.kakaon.global.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;
    private final CookieUtil cookieUtil;

    @Override
    public TokenResponseDto refreshToken(RefreshTokenRequestDto dto) {
        String refreshToken = dto.getRefreshToken();

        // 블랙리스트에 있는 리프레시 토큰인지 확인
        if(!jwtTokenProvider.validateToken(refreshToken)) {
            throw new ApiException(ErrorCode.INVALID_REFRESH_TOKEN);
        }
        String role = jwtTokenProvider.getRole(refreshToken);
        if (role != null) {
            throw new ApiException(ErrorCode.INVALID_REFRESH_TOKEN); // AccessToken이 들어온 경우
        }

        String kakaoId = jwtTokenProvider.getSubject(refreshToken);
        Member member = memberRepository.findByProviderAndProviderId(Provider.KAKAO, kakaoId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        if (member.getDeletedAt() != null) {
            throw new ApiException(ErrorCode.MEMBER_DELETED);
        }
        return jwtTokenProvider.createTokenResponse(kakaoId, member.getRole().name());
    }

    @Override
    public void logout(HttpServletRequest httpRequest) {

        // Authorization 헤더에서 access token 추출
        jwtTokenProvider.resolve(httpRequest).ifPresent(accessToken -> {
            if(jwtTokenProvider.validateToken(accessToken)) {

                jwtTokenProvider.addToBlackList(accessToken);
                log.info("Access token added to blacklist");
            }
        });

        // 쿠키에서 refresh token 추출 -> 블랙리스트에 추가
        cookieUtil.getRefreshTokenFromCookie(httpRequest).ifPresent(refreshToken -> {
            log.info("Refresh Token found in cookie: {}", refreshToken);

            if(jwtTokenProvider.validateToken(refreshToken)) {
                jwtTokenProvider.addToBlackList(refreshToken);
                log.info("Refresh Token from cookie added to blacklist");
            } else {
                log.warn("Refresh Token validation failed, not adding to blacklist");
            }
        });

        // 쿠키에서 refreshToken 찾지 못한 경우 로깅
        if (cookieUtil.getRefreshTokenFromCookie(httpRequest).isEmpty()) {
            log.warn("No refresh token found in cookie during logout");
        }

        log.info("logout 완료!!");
    }
}
