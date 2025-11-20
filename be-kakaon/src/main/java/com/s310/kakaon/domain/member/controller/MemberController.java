package com.s310.kakaon.domain.member.controller;

import com.s310.kakaon.domain.member.dto.MemberResponseDto;
import com.s310.kakaon.domain.member.dto.MemberUpdateRequestDto;
import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.global.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Member", description = "회원 정보 조회 및 관리 API")
@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    /** 내 정보 조회 */
    @Operation(summary = "내 정보 조회", description = "Access Token의 사용자 정보를 기반으로 회원 정보를 조회합니다.")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MemberResponseDto>> getMyInfo(
            @AuthenticationPrincipal String kakaoId,
            HttpServletRequest httpRequest
    ) {
        MemberResponseDto member = memberService.getMemberByProviderId(kakaoId);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "내 정보 조회 성공", member, httpRequest.getRequestURI()));
    }

    /** 내 정보 수정 */
    @Operation(
            summary = "내 정보 수정",
            description = """
                    로그인한 회원의 프로필 정보를 수정합니다.
                    - 닉네임, 전화번호, 알림 수신 설정 등의 필드를 갱신할 수 있습니다.
                    """)
    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<MemberResponseDto>> updateMyInfo(
            @AuthenticationPrincipal String kakaoId,
            @Valid @RequestBody MemberUpdateRequestDto dto,
            HttpServletRequest httpRequest
    ) {
        MemberResponseDto member = memberService.updateMemberByProviderId(kakaoId, dto);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "회원 정보 수정 성공", member, httpRequest.getRequestURI()));
    }

    /** 회원 탈퇴 */
    @Operation(
            summary = "회원 탈퇴 (내 계정)",
            description = """
                    로그인한 회원의 계정을 소프트 삭제(비활성화) 처리합니다.
                    DB에서 완전히 삭제되지는 않습니다.
                    """)
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteMyAccount(@AuthenticationPrincipal String kakaoId, HttpServletRequest httpRequest) {
        memberService.softDeleteMemberByProviderId(kakaoId);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "회원 탈퇴 성공", null, httpRequest.getRequestURI()));
    }
    /** 회원 단건 조회 */
    @Operation(
            summary = "회원 단건 조회 (관리자용)",
            description = """
                    memberId로 특정 회원의 상세 정보를 조회합니다.
                    """)

    @GetMapping("/{memberId}")
    public ResponseEntity<ApiResponse<MemberResponseDto>> getMember(@PathVariable Long memberId, HttpServletRequest httpRequest) {
        MemberResponseDto member = memberService.getMemberById(memberId);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "회원 정보 조회 성공", member, httpRequest.getRequestURI()));
    }

    /** 회원 정보 수정 */
    @Operation(
            summary = "회원 정보 수정",
            description = """
                    memberId를 기준으로 특정 회원의 정보를 수정합니다.
                    """)
    @PatchMapping("/{memberId}")
    public ResponseEntity<ApiResponse<MemberResponseDto>> updateMember(@PathVariable Long memberId, @Valid @RequestBody MemberUpdateRequestDto dto, HttpServletRequest httpRequest) {
        MemberResponseDto member = memberService.updateMember(memberId, dto);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "회원 정보 수정 성공", member, httpRequest.getRequestURI()));
    }

    /** 회원 삭제 */
    @Operation(
            summary = "회원 삭제 ",
            description = """
                    memberId를 기준으로 특정 회원의 계정을 소프트 삭제합니다.
                    """)
    @DeleteMapping("/{memberId}")
    public ResponseEntity<ApiResponse<Void>> deleteMember(@PathVariable Long memberId, HttpServletRequest httpRequest) {
        memberService.softDeleteMember(memberId);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "회원 탈퇴 성공", null, httpRequest.getRequestURI()));
    }
}
