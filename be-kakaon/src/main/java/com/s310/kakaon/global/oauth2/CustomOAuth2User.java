package com.s310.kakaon.global.oauth2;

import com.s310.kakaon.domain.member.entity.Role;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

@Getter
public class CustomOAuth2User implements OAuth2User {

    private final Long memberId;
    private final String email;
    private final Role role;
    private final Map<String, Object> attributes;
    private final String nameAttributeKey;

    public CustomOAuth2User(Long memberId, String email, Role role,
                            Map<String, Object> attributes, String nameAttributeKey) {
        this.memberId = memberId;
        this.email = email;
        this.role = role;
        this.attributes = attributes;
        this.nameAttributeKey = nameAttributeKey;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getName() {
        return String.valueOf(attributes.get(nameAttributeKey));
    }
}
