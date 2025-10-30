package com.s310.kakaon.domain.store.service;


import com.s310.kakaon.domain.store.dto.StoreCreateRequestDto;
import com.s310.kakaon.domain.store.dto.StoreResponseDto;

import java.util.List;

public interface StoreService {
    StoreResponseDto registerStore(Long memberId, StoreCreateRequestDto request);

    StoreResponseDto findStoreById(Long memberId, Long storeId);

    void deleteStore(Long storeId);

    List<StoreResponseDto> getMyStores(Long memberId);





}
