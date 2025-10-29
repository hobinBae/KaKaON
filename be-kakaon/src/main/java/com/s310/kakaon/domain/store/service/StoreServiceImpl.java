package com.s310.kakaon.domain.store.service;

import com.s310.kakaon.domain.store.dto.StoreCreateRequestDto;
import com.s310.kakaon.domain.store.dto.StoreResponseDto;

import java.util.List;

public class StoreServiceImpl implements StoreService{
    @Override
    public StoreResponseDto registerStore(Long memberId, StoreCreateRequestDto request) {
        return null;
    }

    @Override
    public StoreResponseDto findStoreById(Long storeId) {
        return null;
    }

    @Override
    public void deleteStore(Long storeId) {

    }

    @Override
    public List<StoreResponseDto> getMyStores(Long memberId) {
        return List.of();
    }
}
