package com.s310.kakaon.global.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
@Component
@Slf4j
public class OAuth2LoginFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${oauth2.redirect-uri}")
    private String redirectUri;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException, ServletException {

        log.error("OAuth2 로그인 실패: {}", exception.getMessage(), exception);

        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .queryParam("error", exception.getMessage())
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
