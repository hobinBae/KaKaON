package com.s310.kakaon.domain.store.dto;

import io.swagger.v3.oas.annotations.callbacks.Callback;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
public class FavoriteDetailResponseDto {
    private Long storeId;
    private String storeName;

}
