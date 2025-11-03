package com.s310.kakaon.menu.controller;

import com.s310.kakaon.global.dto.ApiResponse;
import com.s310.kakaon.menu.dto.MenuRequestDto;
import com.s310.kakaon.menu.dto.MenuSummaryResponseDto;
import com.s310.kakaon.menu.validation.MenuValidationGroups;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/v1/menus")
@RequiredArgsConstructor
public class MenuController {

    /** 메뉴 리스트 조회 */
    @GetMapping()
    public ResponseEntity<ApiResponse<List<MenuSummaryResponseDto>>> getMenus(
            @RequestParam(name = "storeId") Long storeId,
            HttpServletRequest httpRequest) {

        // Dummy Data
        List<MenuSummaryResponseDto> dummyList = new ArrayList<>();
        for(Long i=0L;i<3;i++){
            dummyList.add(MenuSummaryResponseDto.builder()
                    .menuId(i)
                    .storeId(i+10)
                    .menu("아메리카노"+i)
                    .price(3000)
                    .createdAt(OffsetDateTime.now().toString())
                    .updatedAt(OffsetDateTime.now().toString())
                    .build());
        }
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "메뉴 조회가 성공적으로 완료 되었습니다.", dummyList, httpRequest.getRequestURI()));
    }

    /** 메뉴 생성 */
    @PostMapping()
    public ResponseEntity<ApiResponse<MenuSummaryResponseDto>> createMenu(
            @RequestParam(name = "storeId") Long storeId,
            @Validated(MenuValidationGroups.Create.class) @Valid @RequestBody MenuRequestDto req,
            HttpServletRequest httpRequest) {

        // Dummy Data
        MenuSummaryResponseDto dummy = MenuSummaryResponseDto.builder()
                .menuId(1L)
                .storeId(11L)
                .menu(req.getMenu())
                .price(req.getPrice())
                .imgUrl(req.getImgUrl())
                .createdAt(OffsetDateTime.now().toString())
                .updatedAt(OffsetDateTime.now().toString())
                .build();
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "메뉴 생성이 성공적으로 완료 되었습니다.", dummy, httpRequest.getRequestURI()));
    }

    /** 메뉴 수정 */
    @PatchMapping("/{menuId}")
    public ResponseEntity<ApiResponse<MenuSummaryResponseDto>> updateMenu(
            @PathVariable(name = "menuId") Long menuId,
            @RequestParam(name = "storeId") Long storeId,
            @Validated(MenuValidationGroups.Update.class) @Valid @RequestBody MenuRequestDto req,
            HttpServletRequest httpRequest) {

        // Dummy Data
        MenuSummaryResponseDto dummy = MenuSummaryResponseDto.builder()
                .menuId(1L)
                .storeId(11L)
                .menu(req.getMenu()==null ? "아메리카노" : req.getMenu())
                .price(req.getPrice()==null ? 1000 : req.getPrice())
                .imgUrl(req.getImgUrl()==null ? "www.dummy.com" : req.getImgUrl())
                .updatedAt(OffsetDateTime.now().toString())
                .build();
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "메뉴 수정이 성공적으로 완료 되었습니다.", dummy, httpRequest.getRequestURI()));
    }

    /** 메뉴 삭제 */
    @DeleteMapping("/{menuId}")
    public ResponseEntity<ApiResponse<String>> deleteMenu(
            @PathVariable(name = "menuId") Long menuId,
            @RequestParam(name = "storeId") Long storeId,
            HttpServletRequest httpRequest) {

        return ResponseEntity.ok(ApiResponse.of(HttpStatus.NO_CONTENT, "메뉴 삭제가 성공적으로 완료 되었습니다.", null, httpRequest.getRequestURI()));
    }
}
