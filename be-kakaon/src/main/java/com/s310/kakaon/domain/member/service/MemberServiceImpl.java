package com.s310.kakaon.domain.member.service;

import com.s310.kakaon.domain.member.dto.MemberResponseDto;
import com.s310.kakaon.domain.member.dto.MemberUpdateRequestDto;
import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.entity.Provider;
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
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));
        return MemberResponseDto.fromEntity(member);
    }

    /**
     * providerId로 회원 조회 (JWT 인증용)
     * 현재는 카카오만 지원하므로 Provider.KAKAO 고정
     *
     * @param providerId 카카오 ID
     */
    @Override
    public MemberResponseDto getMemberByProviderId(String providerId) {
        Member member = memberRepository.findByProviderAndProviderId(Provider.KAKAO, providerId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        // 탈퇴한 회원 체크
        if (member.getDeletedAt() != null) {
            throw new ApiException(ErrorCode.MEMBER_DELETED);
        }

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
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        dto.applyToEntity(member);

        return MemberResponseDto.fromEntity(member);
    }

    /**
     * providerId로 회원 수정 (JWT 인증용)
     * 현재는 카카오만 지원하므로 Provider.KAKAO 고정
     *
     * @param providerId 카카오 ID
     */
    @Override
    public MemberResponseDto updateMemberByProviderId(String providerId, MemberUpdateRequestDto dto) {
        Member member = memberRepository.findByProviderAndProviderId(Provider.KAKAO, providerId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        // 탈퇴한 회원 체크
        if (member.getDeletedAt() != null) {
            throw new ApiException(ErrorCode.MEMBER_DELETED);
        }
        dto.applyToEntity(member);

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
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));
        member.softDelete();
    }

    /**
     * providerId로 회원 탈퇴 (JWT 인증용)
     * 현재는 카카오만 지원하므로 Provider.KAKAO 고정
     *
     * @param providerId 카카오 ID
     */
    @Override
    public void softDeleteMemberByProviderId(String providerId) {
        Member member = memberRepository.findByProviderAndProviderId(Provider.KAKAO, providerId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        // 탈퇴한 회원 체크
        if (member.getDeletedAt() != null) {
            throw new ApiException(ErrorCode.MEMBER_DELETED);
        }
        member.softDelete();
    }
}
