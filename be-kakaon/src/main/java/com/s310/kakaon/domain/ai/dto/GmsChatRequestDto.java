package com.s310.kakaon.domain.ai.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

// GMS 채팅 API 요청을 위한 DTO를 정의했음
@Getter
@AllArgsConstructor
public class GmsChatRequestDto {
    private String model;
    private List<Message> messages;

    @Getter
    @AllArgsConstructor
    public static class Message {
        private String role;
        private String content;
    }
}
