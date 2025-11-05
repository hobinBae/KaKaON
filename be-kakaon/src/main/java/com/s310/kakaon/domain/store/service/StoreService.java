package com.s310.kakaon.domain.store.service;


import com.s310.kakaon.domain.store.dto.*;

import java.util.List;

public interface StoreService {
    StoreResponseDto registerStore(Long memberId, StoreCreateRequestDto request);

    StoreResponseDto findStoreById(Long memberId, Long storeId);

    OperationStatusUpdateResponseDto updateOperationStatus(Long memberId, Long storeId, OperationStatusUpdateRequestDto request);

    OperationStatusUpdateResponseDto getOperationStatus(Long memberId, Long storeId);

    void deleteStore(Long memberId, Long storeId);

    List<StoreResponseDto> getMyStores(Long memberId);

}
