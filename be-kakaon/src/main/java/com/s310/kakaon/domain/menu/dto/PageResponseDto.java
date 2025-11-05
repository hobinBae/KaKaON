package com.s310.kakaon.domain.menu.dto;

import lombok.*;

import java.util.List;

@Getter @Builder
@AllArgsConstructor
public class PageResponseDto<T> {
    private List<T> content;   // 실 데이터
    private int page;          // 0-base
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;

    public static <T> PageResponseDto<T> of(org.springframework.data.domain.Page<T> page) {
        return PageResponseDto.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}