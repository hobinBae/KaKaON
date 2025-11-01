package com.s310.kakaon.domain.store.alert.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class AlertRecipientResponseDto {

    private Long id;
    private String name;
    private String position;
    private String email;
    private Boolean active;

}
