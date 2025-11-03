package com.s310.kakaon.domain.store.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class AlertRecipientUpdateRequestDto {

    private String name;
    private String email;
    private String position;
    private Boolean active;


}
