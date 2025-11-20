package com.s310.kakaon.domain.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// GMS 채팅 API 응답을 위한 DTO를 정의했음
@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true) // 응답에 포함된 필드 중 사용하지 않는 필드는 무시하도록 설정
public class GmsChatResponseDto {
    private List<Choice> choices;

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Choice {
        private Message message;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class Message {
        private String content;
    }
}
