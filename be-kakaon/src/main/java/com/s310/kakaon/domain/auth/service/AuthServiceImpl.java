package com.s310.kakaon.domain.auth.service;

import com.s310.kakaon.domain.auth.dto.RefreshTokenRequestDto;
import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.entity.Provider;
import com.s310.kakaon.domain.member.entity.Role;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import com.s310.kakaon.global.jwt.JwtTokenProvider;
import com.s310.kakaon.global.jwt.TokenResponseDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;

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

    }
}
