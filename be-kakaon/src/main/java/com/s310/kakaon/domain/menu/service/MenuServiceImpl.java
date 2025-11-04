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

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

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
            new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }

        // 3) 저장
        Menu menu = Menu.builder()
                .store(store)
                .name(req.getMenu())
                .price(req.getPrice())
                .imgUrl(req.getImgUrl())
                .build();
        Menu saved = menuRepository.save(menu);

        String created = saved.getCreatedDateTime() == null ? null : saved.getCreatedDateTime().toInstant(ZoneOffset.UTC).toString();
        String updated = saved.getLastModifiedDateTime() == null ? null : saved.getLastModifiedDateTime().toInstant(ZoneOffset.UTC).toString();

        return new MenuSummaryResponseDto(
                saved.getMenuId(),
                store.getId(),
                saved.getName(),
                saved.getPrice(),
                saved.getImgUrl(),
                created,
                updated
        );
    }

}
