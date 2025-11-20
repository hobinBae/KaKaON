package com.s310.kakaon.global.oauth2;

import com.s310.kakaon.domain.member.entity.Provider;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class OAuth2Attributes {
    private Map<String, Object> attributes;
    private String nameAttributeKey;
    private String providerId;
    private String email;
    private String name;
    private Provider provider;

    public static OAuth2Attributes of(String registrationId, String userNameAttributeName,
                                       Map<String, Object> attributes) {
        if ("kakao".equals(registrationId)) {
            return ofKakao(userNameAttributeName, attributes);
        }

        throw new IllegalArgumentException("지원하지 않는 OAuth2 제공자입니다: " + registrationId);
    }

    private static OAuth2Attributes ofKakao(String userNameAttributeName, Map<String, Object> attributes) {
        Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
        Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");

        return OAuth2Attributes.builder()
                .providerId(String.valueOf(attributes.get("id")))
                .email((String) kakaoAccount.get("email"))
                .name((String) profile.get("nickname"))
                .provider(Provider.KAKAO)
                .attributes(attributes)
                .nameAttributeKey(userNameAttributeName)
                .build();
    }
}
