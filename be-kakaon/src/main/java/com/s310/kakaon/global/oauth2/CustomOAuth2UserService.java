package com.s310.kakaon.global.oauth2;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.entity.Role;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final MemberRepository memberRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails()
                .getUserInfoEndpoint()
                .getUserNameAttributeName();

        log.info("OAuth2 로그인 시도 - Provider: {}", registrationId);

        OAuth2Attributes attributes = OAuth2Attributes.of(
                registrationId,
                userNameAttributeName,
                oAuth2User.getAttributes()
        );

        Member member = saveOrUpdate(attributes);

        return new CustomOAuth2User(
                member.getId(),
                member.getEmail(),
                member.getRole(),
                attributes.getAttributes(),
                attributes.getNameAttributeKey()
        );
    }

    private Member saveOrUpdate(OAuth2Attributes attributes) {
        Member member = memberRepository.findByProviderAndProviderId(
                        attributes.getProvider(),
                        attributes.getProviderId())
                .map(entity -> {
                    // 기존 회원 정보 업데이트
                    entity.updateName(attributes.getName());
                    log.info("기존 회원 정보 업데이트 - Email: {}", entity.getEmail());
                    return entity;
                })
                .orElseGet(() -> {
                    // 신규 회원 생성
                    Member newMember = Member.builder()
                            .email(attributes.getEmail())
                            .name(attributes.getName())
                            .provider(attributes.getProvider())
                            .providerId(attributes.getProviderId())
                            .role(Role.USER)
                            .receiveEmail(true)
                            .build();
                    log.info("신규 회원 가입 - Email: {}", newMember.getEmail());
                    return newMember;
                });

        return memberRepository.save(member);
    }
}
