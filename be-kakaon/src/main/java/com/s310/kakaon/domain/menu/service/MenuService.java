package com.s310.kakaon.domain.menu.service;

import com.s310.kakaon.domain.menu.dto.MenuRequestDto;
import com.s310.kakaon.domain.menu.dto.MenuSummaryResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface MenuService {
    MenuSummaryResponseDto create(Long storeId, MenuRequestDto req, Long userId);
    MenuSummaryResponseDto update(Long memberId, MenuRequestDto req, Long storeId, Long menuId);
    void delete(Long memberId, Long menuId, Long storeId);
    Page<MenuSummaryResponseDto> getMenus(Long memberId, Long storeId, Pageable pageable);
}
