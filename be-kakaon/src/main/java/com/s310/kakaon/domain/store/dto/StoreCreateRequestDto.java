package com.s310.kakaon.domain.store.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreCreateRequestDto {

    private String name;
    private String businessNumber;
//    private Long ownerId; 회원이 가맹점을 등록하고 대표자라고 가정한다면 필요없는 데이터 같다.
    private String address;
    private String phone;
    private String city;
    private String state;
    private String postalCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String businessType;
    private List<BusinessHourDto> businessHours;


}
