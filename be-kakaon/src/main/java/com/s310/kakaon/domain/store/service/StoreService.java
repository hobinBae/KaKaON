package com.s310.kakaon.domain.store.service;


import com.s310.kakaon.domain.store.dto.*;
import com.s310.kakaon.global.dto.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface StoreService {
    StoreDetailResponseDto registerStore(Long memberId, StoreCreateRequestDto request);

    StoreDetailResponseDto findStoreById(Long memberId, Long storeId);

    OperationStatusUpdateResponseDto updateOperationStatus(Long memberId, Long storeId, OperationStatusUpdateRequestDto request);

    OperationStatusUpdateResponseDto getOperationStatus(Long memberId, Long storeId);

    void deleteStore(Long memberId, Long storeId);

    PageResponse<StoreResponseDto> getMyStores(Long memberId, Pageable pageable);

    StoreDetailResponseDto updateStore(Long memberId, Long storeId, StoreUpdateRequestDto request);

    FavoriteResponseDto toggleFavorite(Long memberId, Long storeId);

    FavoriteDetailResponseDto getFavorite(Long memberId);
    void generate(Long memberId);
}
