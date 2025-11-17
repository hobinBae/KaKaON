package com.s310.kakaon.domain.ai.controller;

import com.s310.kakaon.domain.ai.dto.AiInsightRequestDto;
import com.s310.kakaon.domain.ai.service.AiService;
import com.s310.kakaon.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// AI 관련 API 요청을 처리하는 컨트롤러를 정의했음
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ai")
public class AiController {

    private final AiService aiService;

    // 프론트엔드로부터 AI 인사이트 요청을 받아 처리하는 엔드포인트를 정의했음
    @PostMapping("/insight")
    public ResponseEntity<ApiResponse<String>> getAiInsight(@RequestBody AiInsightRequestDto requestDto) {
        String insight = aiService.getAiInsight(requestDto.getPrompt());
        return ResponseEntity.ok(ApiResponse.onSuccess(insight));
    }
}
