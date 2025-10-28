package com.s310.kakaon.domain.member.dto;

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

    @NotBlank(message = "이름은 필수 입력 항목입니다.")
    private String name;

    @Pattern(regexp = "^(010|011|016|017|018|019)-?\\d{3,4}-?\\d{4}$",
            message = "전화번호 형식이 올바르지 않습니다.")
    private String phone;

    @Email(message = "이메일 형식이 올바르지 않습니다.")
    private String email;

    private boolean receiveEmail;

    /**
     * 엔티티에 반영하는 메서드 (Service 계층에서 사용)
     */
    public void applyToEntity(com.s310.kakaon.domain.member.entity.Member member) {
        member.updateName(this.name);
        member.updatePhone(this.phone);
        member.setReceiveEmail(this.receiveEmail);

    }
}
