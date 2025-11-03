package com.s310.kakaon.global.jwt;

import com.s310.kakaon.domain.member.entity.Role;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.global.exception.ErrorCode;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwt;
    private final JwtAuthenticationEntryPoint entryPoint;
    private final MemberRepository memberRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        // OAuth2 관련 경로는 JWT 필터 건너뛰기
        String path = request.getRequestURI();
        if (path.startsWith("/oauth2/") || path.startsWith("/login/oauth2/") || path.startsWith("/auth/") || path.equals("/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = jwt.resolve(request).orElse(null);
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 토큰 유효성 검증
            if (!jwt.validateToken(token)) {
                request.setAttribute("errorCode", ErrorCode.INVALID_TOKEN);
                filterChain.doFilter(request, response);
                return;
            }

            // 토큰에서 사용자 정보 추출
            var claims = jwt.parseClaims(token);
            String kakaoId = claims.getSubject();
            String roleStr = jwt.getRole(token);

            // request에 subject 저장 (필요한 경우 컨트롤러에서 사용)
            request.setAttribute("kakaoId", kakaoId);

            // SecurityContext에 인증 정보가 없는 경우에만 설정
            if (kakaoId != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // Role을 GrantedAuthority로 변환
                Role role = roleStr != null ? Role.valueOf(roleStr) : Role.USER;
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role.name());

                // Authentication 객체 생성
                // principal: kakaoId (providerId)
                // credentials: null (인증 완료 후에는 비워둠)
                // authorities: 사용자 권한
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                kakaoId,
                                null,
                                Collections.singletonList(authority)
                        );

                // 요청 정보를 Authentication에 추가
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // SecurityContext에 인증 정보 설정
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("JWT 인증 성공 - kakaoId: {}, role: {}", kakaoId, role);
            }

            // [선택사항] DB에서 Member 정보를 조회해서 최신 정보로 인증하려면:
            // Member member = memberRepository.findByProviderId(kakaoId)
            //     .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));
            //
            // 이 경우 soft delete 체크도 필요:
            // if (member.getDeletedAt() != null) {
            //     throw new ApiException(ErrorCode.MEMBER_DELETED);
            // }

        } catch (ExpiredJwtException e) {
            log.debug("만료된 토큰: {}", e.getMessage());
            request.setAttribute("errorCode", ErrorCode.TOKEN_EXPIRED);
        } catch (JwtException | IllegalArgumentException e) {
            log.warn("유효하지 않은 토큰: {}", e.getMessage());
            request.setAttribute("errorCode", ErrorCode.INVALID_TOKEN);
        } catch (Exception e) {
            log.error("JWT 인증 처리 중 오류 발생", e);
            request.setAttribute("errorCode", ErrorCode.INTERNAL_SERVER_ERROR);
        }

        filterChain.doFilter(request, response);
    }
}
