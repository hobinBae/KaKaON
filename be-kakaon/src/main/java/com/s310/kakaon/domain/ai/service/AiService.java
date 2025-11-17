package com.s310.kakaon.domain.ai.service;

import com.s310.kakaon.domain.ai.dto.GmsChatRequestDto;
import com.s310.kakaon.domain.ai.dto.GmsChatResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Collections;

// GMS API 호출을 담당하는 서비스 클래스를 정의했음
@Service
@RequiredArgsConstructor
public class AiService {

    private final WebClient gmsWebClient;

    public String getAiInsight(String prompt) {
        // GMS API에 전달할 요청 바디를 생성했음
        GmsChatRequestDto requestDto = new GmsChatRequestDto(
                "gpt-4o-mini",
                Collections.singletonList(new GmsChatRequestDto.Message("user", prompt))
        );

        try {
            // WebClient를 사용하여 GMS API에 POST 요청을 동기 방식으로 보냈음
            GmsChatResponseDto response = gmsWebClient.post()
                    .uri("/chat/completions")
                    .bodyValue(requestDto)
                    .retrieve()
                    .bodyToMono(GmsChatResponseDto.class)
                    .block(); // 비동기 결과를 동기적으로 기다림

            // 응답에서 실제 텍스트 내용을 추출했음
            if (response != null && response.getChoices() != null && !response.getChoices().isEmpty()) {
                return response.getChoices().get(0).getMessage().getContent();
            }
            return "AI 인사이트를 생성하지 못했습니다.";
        } catch (Exception e) {
            // 에러 발생 시 대체 메시지를 반환했음
            System.err.println("Error calling GMS API: " + e.getMessage());
            return "AI 인사이트를 가져오는 중 오류가 발생했습니다.";
        }
    }
}
