package com.s310.kakaon.domain.member.service;

import com.s310.kakaon.domain.member.dto.MemberResponseDto;
import com.s310.kakaon.domain.member.dto.MemberUpdateRequestDto;

public interface MemberService {

    /** 회원 단건 조회 */
    MemberResponseDto getMemberById(Long id);

    /** 회원 정보 수정 */
    MemberResponseDto updateMember(Long id, MemberUpdateRequestDto dto);

    /** 회원 탈퇴 */
    void softDeleteMember(Long id);
}
