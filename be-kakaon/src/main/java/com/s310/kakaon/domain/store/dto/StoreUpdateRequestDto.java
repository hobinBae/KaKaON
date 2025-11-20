package com.s310.kakaon.domain.store.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class StoreUpdateRequestDto {

    private String name;
    private BusinessType businessType;
    private String phone;
    private List<BusinessHourDto> businessHours;

}
