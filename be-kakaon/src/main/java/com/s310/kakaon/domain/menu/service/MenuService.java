package com.s310.kakaon.domain.menu.service;

import com.s310.kakaon.domain.menu.dto.MenuRequestDto;
import com.s310.kakaon.domain.menu.dto.MenuSummaryResponseDto;

public interface MenuService {
    MenuSummaryResponseDto create(Long storeId, MenuRequestDto req, Long userId);
    MenuSummaryResponseDto update(Long memberId, MenuRequestDto req, Long storeId, Long menuId);
}
