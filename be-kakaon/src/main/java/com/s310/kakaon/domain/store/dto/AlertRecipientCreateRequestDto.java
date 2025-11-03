package com.s310.kakaon.domain.store.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class AlertRecipientCreateRequestDto {

    private String name;
    private String position;
    private String email;

}
