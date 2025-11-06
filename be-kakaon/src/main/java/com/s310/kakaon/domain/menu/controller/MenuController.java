package com.s310.kakaon.domain.menu.controller;

import com.s310.kakaon.domain.member.service.MemberService;
import com.s310.kakaon.domain.menu.dto.PageResponseDto;
import com.s310.kakaon.domain.menu.service.MenuService;
import com.s310.kakaon.global.dto.ApiResponse;
import com.s310.kakaon.domain.menu.dto.MenuRequestDto;
import com.s310.kakaon.domain.menu.dto.MenuSummaryResponseDto;
import com.s310.kakaon.domain.menu.validation.MenuValidationGroups;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;


@Tag(name = "Menu", description = "가맹점 메뉴 등록 / 수정 / 삭제 / 조회 API")
@RestController
@RequestMapping("/api/v1/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MemberService memberService;
    private final MenuService menuService;

    /** 메뉴 리스트 조회 */
    @Operation(
            summary = "메뉴 리스트 조회",
            description = """
                    특정 가맹점(storeId)의 전체 메뉴를 페이징하여 조회합니다.
                    기본 정렬 기준은 '생성일 오름차순'입니다.
                    """
    )
    @GetMapping()
    public ResponseEntity<ApiResponse<PageResponseDto<MenuSummaryResponseDto>>> getMenus(
            @AuthenticationPrincipal String kakaoId,
            @RequestParam(name = "storeId") Long storeId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "24") int size,
            HttpServletRequest httpRequest) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdDateTime"));
        var paged = menuService.getMenus(memberId, storeId, pageable);
        var response = PageResponseDto.of(paged);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "메뉴 조회가 성공적으로 완료 되었습니다.", response, httpRequest.getRequestURI()));
    }

    /** 메뉴 생성 */
    @Operation(
            summary = "메뉴 생성",
            description = """
                    새로운 메뉴를 등록합니다.
                    - storeId를 반드시 Query Parameter로 전달해야 합니다.
                    - Request Body에는 메뉴명, 가격, 이미지 URL, 설명 등이 포함됩니다.
                    """
    )
    @PostMapping()
    public ResponseEntity<ApiResponse<MenuSummaryResponseDto>> createMenu(
            @AuthenticationPrincipal String kakaoId,
            @RequestParam(name = "storeId") Long storeId,
            @Validated(MenuValidationGroups.Create.class) @Valid @RequestBody MenuRequestDto req,
            HttpServletRequest httpRequest) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        MenuSummaryResponseDto responseDto = menuService.create(memberId, req, storeId);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "메뉴 생성이 성공적으로 완료 되었습니다.", responseDto, httpRequest.getRequestURI()));
    }

    /** 메뉴 수정 */
    @PatchMapping("/{menuId}")
    @Operation(
            summary = "메뉴 수정",
            description = """
                    기존 메뉴의 정보를 수정합니다.
                    - PathVariable: menuId
                    - QueryParam: storeId
                    - Body: 수정할 메뉴의 이름, 가격, 설명, 이미지 URL 등
                    """
    )
    public ResponseEntity<ApiResponse<MenuSummaryResponseDto>> updateMenu(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable(name = "menuId") Long menuId,
            @RequestParam(name = "storeId") Long storeId,
            @Validated(MenuValidationGroups.Update.class) @Valid @RequestBody MenuRequestDto req,
            HttpServletRequest httpRequest) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        MenuSummaryResponseDto responseDto = menuService.update(memberId, req, storeId, menuId);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.OK, "메뉴 수정이 성공적으로 완료 되었습니다.", responseDto, httpRequest.getRequestURI()));
    }

    /** 메뉴 삭제 */
    @Operation(
            summary = "메뉴 삭제",
            description = """
                    특정 가맹점(storeId)의 메뉴(menuId)를 삭제합니다.
                    삭제된 메뉴는 실제로 DB에서 제거되며, 연관된 주문에는 영향을 주지 않습니다.
                    """
    )
    @DeleteMapping("/{menuId}")
    public ResponseEntity<ApiResponse<String>> deleteMenu(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable(name = "menuId") Long menuId,
            @RequestParam(name = "storeId") Long storeId,
            HttpServletRequest httpRequest) {
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();
        menuService.delete(memberId, menuId, storeId);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.NO_CONTENT, "메뉴 삭제가 성공적으로 완료 되었습니다.", null, httpRequest.getRequestURI()));
    }
}
