package com.s310.kakaon.domain.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class RefreshTokenRequestDto {

    @NotBlank
    private String refreshToken;
}
