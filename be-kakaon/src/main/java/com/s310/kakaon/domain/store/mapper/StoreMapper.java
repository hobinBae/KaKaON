package com.s310.kakaon.domain.store.mapper;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.store.dto.BusinessHourDto;
import com.s310.kakaon.domain.store.dto.StoreCreateRequestDto;
import com.s310.kakaon.domain.store.dto.StoreResponseDto;
import com.s310.kakaon.domain.store.entity.BusinessHour;
import com.s310.kakaon.domain.store.entity.Store;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
public class StoreMapper {

    public StoreResponseDto toResponseDto(Store store){
        return StoreResponseDto.builder()
                .storeId(store.getStoreId())
                .ownerName(store.getMember().getName())
                .businessType(store.getBusinessType())
                .address(store.getAddress())
                .name(store.getName())
                .phone(store.getPhone())
                .businessNumber(store.getBusinessNumber())
                .status(store.getStatus())
                .createdAt(store.getCreatedDateTime())
                .businessHours(
                        store.getBusinessHours().stream()
                                .map(bh -> new BusinessHourDto(
                                        bh.getDayOfWeek(),
                                        bh.getOpenTime() != null ? bh.getOpenTime().toString() : null,
                                        bh.getCloseTime() != null ? bh.getCloseTime().toString() : null,
                                        bh.isClosed()
                                ))
                                .toList()
                )
                .build();
    }

    public Store toEntity(StoreCreateRequestDto dto, Member member) {
        Store store = Store.builder()
                .member(member)
                .name(dto.getName())
                .businessNumber(dto.getBusinessNumber())
                .businessType(dto.getBusinessType())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .city(dto.getCity())
                .state(dto.getState())
                .postalCode(dto.getPostalCode())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .build();

        if (dto.getBusinessHours() != null) {
            dto.getBusinessHours().forEach(hourDto -> {
                BusinessHour businessHour = BusinessHour.builder()
                        .dayOfWeek(hourDto.getDayOfWeek())
                        .openTime(hourDto.getOpenTime() != null ? LocalTime.parse(hourDto.getOpenTime()) : null)
                        .closeTime(hourDto.getCloseTime() != null ? LocalTime.parse(hourDto.getCloseTime()) : null)
                        .closed(hourDto.isClosed())
                        .build();
                store.addBusinessHour(businessHour);
            });
        }

        return store;
    }

}
