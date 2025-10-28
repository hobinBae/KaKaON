package com.s310.kakaon.domain.member.service;

import com.s310.kakaon.domain.member.dto.MemberResponseDto;
import com.s310.kakaon.domain.member.dto.MemberUpdateRequestDto;
import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;


    /**
     * 회원 단건 조회
     *
     * @param id
     */
    @Override
    public MemberResponseDto getMemberById(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        return MemberResponseDto.fromEntity(member);
    }

    /**
     * 회원 정보 수정
     *
     * @param id
     * @param dto
     */
    @Override
    public MemberResponseDto updateMember(Long id, MemberUpdateRequestDto dto) {
        Member member =  memberRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        member.updateName(dto.getName());
        member.updatePhone(dto.getPhone());
        member.setReceiveEmail(dto.isReceiveEmail());

        return MemberResponseDto.fromEntity(member);
    }

    /**
     * 회원 탈퇴
     *
     * @param id
     */
    @Override
    public void softDeleteMember(Long id) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));
        member.softDelete();
    }
}
