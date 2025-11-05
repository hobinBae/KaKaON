package com.s310.kakaon.domain.menu.service;

import com.s310.kakaon.domain.menu.dto.MenuRequestDto;
import com.s310.kakaon.domain.menu.dto.MenuSummaryResponseDto;
import com.s310.kakaon.domain.menu.entity.Menu;
import com.s310.kakaon.domain.menu.repository.MenuRepository;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
@Transactional
public class MenuServiceImpl implements MenuService{
    private final MenuRepository menuRepository;
    private final StoreRepository storeRepository;

    @Transactional
    public MenuSummaryResponseDto create(Long storeId, MenuRequestDto req, Long userId) {
        // 1) 매장 존재 확인
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        // 2) 접근 권한 확인
        if(!store.getMember().getId().equals(userId)){
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }

        // 3) 저장
        Menu menu = Menu.builder()
                .store(store)
                .name(req.getMenu())
                .price(req.getPrice())
                .imgUrl(req.getImgUrl())
                .build();
        Menu saved = menuRepository.save(menu);

        return new MenuSummaryResponseDto(
                saved.getMenuId(),
                store.getId(),
                saved.getName(),
                saved.getPrice(),
                saved.getImgUrl(),
                toIso(saved.getCreatedDateTime()),
                toIso(saved.getLastModifiedDateTime())
        );
    }

    @Transactional
    public MenuSummaryResponseDto update(Long userId, MenuRequestDto req, Long storeId, Long menuId) {
        // 1) 매장 존재 확인
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        // 2) 메뉴 존재 확인
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new ApiException(ErrorCode.MENU_NOT_FOUND));

        // 3) 접근 권한 확인
        if(!store.getMember().getId().equals(userId)){
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }

        if(!menu.getStore().getId().equals(store.getId())){
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }

        // 4) 수정
        menu.updatePartial(req.getMenu(), req.getPrice(), req.getImgUrl());
        Menu saved = menuRepository.save(menu);

        return new MenuSummaryResponseDto(
                saved.getMenuId(),
                storeId,
                saved.getName(),
                saved.getPrice(),
                saved.getImgUrl(),
                toIso(saved.getCreatedDateTime()),
                toIso(saved.getLastModifiedDateTime())
        );
    }

    @Transactional
    public void delete(Long userId, Long menuId, Long storeId) {

        // 1) 매장 존재 확인
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        // 2) 메뉴 존재 확인
        Menu menu = menuRepository.findById(menuId)
                .orElseThrow(() -> new ApiException(ErrorCode.MENU_NOT_FOUND));

        // 3) 접근 권한 확인
        if(!store.getMember().getId().equals(userId)){
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }

        if(!menu.getStore().getId().equals(store.getId())){
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }

        // 4) 수정
        menu.softDelete();
    }

    private String toIso(LocalDateTime dt) {
        return (dt == null) ? null : dt.atOffset(ZoneOffset.UTC).toInstant().toString();
    }
}
