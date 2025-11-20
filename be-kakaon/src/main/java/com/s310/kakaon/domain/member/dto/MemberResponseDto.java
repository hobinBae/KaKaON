package com.s310.kakaon.domain.member.dto;

import com.s310.kakaon.domain.member.entity.Member;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class MemberResponseDto {

    private Long id;
    private String email;
    private String name;
    private String phone;
    private String provider;
    private String role;
    private boolean receiveEmail;
    private String adminPin;
    private LocalDateTime createdDateTime;
    private LocalDateTime lastModifiedDateTime;

    /** Entity → DTO 변환 메서드 */
    public static MemberResponseDto fromEntity(Member member) {
        return MemberResponseDto.builder()
                .id(member.getId())
                .email(member.getEmail())
                .name(member.getName())
                .phone(member.getPhone())
                .provider(member.getProvider().name())
                .role(member.getRole().name())
                .receiveEmail(member.isReceiveEmail())
                .adminPin(member.getAdminPin())
                .createdDateTime(member.getCreatedDateTime())
                .lastModifiedDateTime(member.getLastModifiedDateTime())
                .build();
    }
}
