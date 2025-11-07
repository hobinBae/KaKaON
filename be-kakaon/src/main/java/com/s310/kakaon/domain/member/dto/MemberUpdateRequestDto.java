package com.s310.kakaon.domain.member.dto;

import com.s310.kakaon.domain.member.entity.Member;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MemberUpdateRequestDto {

    private String name;

    @Pattern(regexp = "^$|^(010|011|016|017|018|019)-?\\d{3,4}-?\\d{4}$",
            message = "전화번호 형식이 올바르지 않습니다.")
    private String phone;

    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    private Boolean receiveEmail;

    private String adminPin;

    /**
     * 엔티티에 반영하는 메서드 (Service 계층에서 사용)
     */
    public void applyToEntity(Member member) {
        if (this.name != null) member.updateName(this.name);
        if (this.phone != null) {
            // 빈 문자열인 경우 null로 저장 (전화번호 삭제)
            member.updatePhone(this.phone.isEmpty() ? null : this.phone);
        }
        if (this.receiveEmail != null) member.setReceiveEmail(this.receiveEmail);
        if (this.adminPin != null) member.updateAdminPin(this.adminPin);
    }
}
