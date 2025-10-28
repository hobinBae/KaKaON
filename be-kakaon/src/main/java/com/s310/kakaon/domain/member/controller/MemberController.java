package com.s310.kakaon.domain.member.controller;

import com.s310.kakaon.domain.member.dto.MemberResponseDto;
import com.s310.kakaon.domain.member.dto.MemberUpdateRequestDto;
import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.global.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    /** 회원 단건 조회 */
    @GetMapping("/{memberId}")
    public ResponseEntity<ApiResponse<MemberResponseDto>> getMember(@PathVariable Long memberId, HttpServletRequest httpRequest) {
        MemberResponseDto member = memberService.getMemberById(memberId);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "회원 정보 조회 성공", member, httpRequest.getRequestURI()));
    }

    /** 회원 정보 수정 */
    @PatchMapping("/{memberId}")
    public ResponseEntity<ApiResponse<MemberResponseDto>> updateMember(@PathVariable Long memberId, @Valid @RequestBody MemberUpdateRequestDto dto, HttpServletRequest httpRequest) {
        MemberResponseDto member = memberService.updateMember(memberId, dto);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "회원 정보 수정 성공", member, httpRequest.getRequestURI()));
    }

    /** 회원 삭제 */
    @DeleteMapping("/{memberId}")
    public ResponseEntity<ApiResponse<Void>> deleteMember(@PathVariable Long memberId, HttpServletRequest httpRequest) {
        memberService.softDeleteMember(memberId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.of(HttpStatus.NO_CONTENT, "회원 탈퇴 성공", null, httpRequest.getRequestURI()));
    }
}
