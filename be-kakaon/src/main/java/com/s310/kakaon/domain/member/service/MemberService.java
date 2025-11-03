package com.s310.kakaon.domain.member.service;

import com.s310.kakaon.domain.member.dto.MemberResponseDto;
import com.s310.kakaon.domain.member.dto.MemberUpdateRequestDto;

public interface MemberService {

    /** 회원 단건 조회 */
    MemberResponseDto getMemberById(Long id);

    /** providerId로 회원 조회 (JWT 인증용) */
    MemberResponseDto getMemberByProviderId(String providerId);

    /** 회원 정보 수정 */
    MemberResponseDto updateMember(Long id, MemberUpdateRequestDto dto);

    MemberResponseDto updateMemberByProviderId(String providerId, MemberUpdateRequestDto dto);

    /** 회원 탈퇴 */
    void softDeleteMember(Long id);

    void softDeleteMemberByProviderId(String providerId);
}
