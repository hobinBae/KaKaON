package com.s310.kakaon.domain.ai.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// AI 인사이트 요청을 위한 DTO를 정의했음
@Getter
@Setter
@NoArgsConstructor
public class AiInsightRequestDto {
    private String prompt;
}
