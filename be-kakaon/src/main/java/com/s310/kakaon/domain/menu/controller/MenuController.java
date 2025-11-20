package com.s310.kakaon.domain.menu.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.s310.kakaon.domain.file.service.FileStorageService;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@Tag(name = "Menu", description = "가맹점 메뉴 등록 / 수정 / 삭제 / 조회 API")
@RestController
@RequestMapping("/api/v1/menus")
@RequiredArgsConstructor
public class MenuController {

    private final MemberService memberService;
    private final MenuService menuService;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

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
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdDateTime"));
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
        MenuSummaryResponseDto responseDto = menuService.create(storeId, req, memberId);
        return ResponseEntity.ok(ApiResponse.of(HttpStatus.CREATED, "메뉴 생성이 성공적으로 완료 되었습니다.", responseDto, httpRequest.getRequestURI()));
    }

    /** 메뉴 생성 */
    @Operation(
            summary = "메뉴 생성 V2 (이미지 첨부 버전)",
            description = """
                    새로운 메뉴를 등록합니다.
                    요청 형식: multipart/form-data
                    
                    - storeId를 반드시 Query Parameter로 전달해야 합니다.
                    - Form-data Fields:
                        - data: 메뉴 정보(JSON 문자열, MenuRequestDto)
                            {
                                "menu" : "아메리카노",
                                "price":5000
                            }
                        - image: 메뉴 이미지 파일 (선택)
                    이미지가 포함된 경우 S3에 업로드되며, 업로드된 이미지 URL이 imgUrl로 자동 설정됩니다.
                    이미지가 없으면 imgUrl은 null로 저장됩니다.
                    """
    )
    @PostMapping(
            value = "/v2",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<ApiResponse<MenuSummaryResponseDto>> createMenuV2(
            @AuthenticationPrincipal String kakaoId,
            @RequestParam(name = "storeId") Long storeId,
            @RequestParam("data") String data,
            @RequestPart(value = "image", required = false) MultipartFile image,
            HttpServletRequest httpRequest) throws JsonProcessingException {

        // 1) JSON 문자열을 DTO로 변환
        MenuRequestDto req = objectMapper.readValue(data, MenuRequestDto.class);

        // 2) 이미지가 있을 경우 S3 업로드
        if (image != null && !image.isEmpty()) {
            String imgUrl = fileStorageService.uploadMenuImage(storeId, image);
            req.setImgUrl(imgUrl);
        }

        // 3) 회원 정보 가져오기
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        // 4) 실제 메뉴 생성
        MenuSummaryResponseDto responseDto = menuService.create(storeId, req, memberId);
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

    /** 메뉴 수정 */
    @PatchMapping(
            value = "/v2/{menuId}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @Operation(
            summary = "메뉴 수정 V2 (이미지 첨부 버전)",
            description = """
                    기존 메뉴의 정보를 수정합니다.
                    요청 형식: multipart/form-data
                    - PathVariable: menuId
                    - QueryParam: storeId
                    - Form-data Fields:
                        - data: 메뉴 정보(JSON 문자열, MenuRequestDto)
                            {
                                "menu" : "아메리카노",
                                "price":5000
                            }
                        - image: 메뉴 이미지 파일 (선택)
                    이미지가 포함된 경우 S3에 업로드되며, 업로드된 이미지 URL이 imgUrl로 자동 설정됩니다.
                    이미지가 없으면 기존 이미지를 유지합니다.
                    """
    )
    public ResponseEntity<ApiResponse<MenuSummaryResponseDto>> updateMenuV2(
            @AuthenticationPrincipal String kakaoId,
            @PathVariable(name = "menuId") Long menuId,
            @RequestParam(name = "storeId") Long storeId,
            @RequestParam("data") String data,
            @RequestPart(value = "image", required = false) MultipartFile image,
            HttpServletRequest httpRequest) throws JsonProcessingException {
        // 1) JSON 문자열을 DTO로 변환
        MenuRequestDto req = objectMapper.readValue(data, MenuRequestDto.class);

        // 2) 이미지가 있을 경우 S3 업로드 후 imgUrl 설정
        if (image != null && !image.isEmpty()) {
            String imgUrl = fileStorageService.uploadMenuImage(storeId, image);
            req.setImgUrl(imgUrl);
        }

        // 3) 회원 정보 가져오기
        Long memberId = memberService.getMemberByProviderId(kakaoId).getId();

        // 4) 실제 메뉴 수정
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
