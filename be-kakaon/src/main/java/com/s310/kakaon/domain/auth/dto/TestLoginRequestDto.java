package com.s310.kakaon.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestLoginRequestDto {

    @NotBlank
    private String testId;
    @NotBlank
    private String testPassword;
}
