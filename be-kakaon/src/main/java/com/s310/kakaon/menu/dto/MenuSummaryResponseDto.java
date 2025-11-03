package com.s310.kakaon.menu.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuSummaryResponseDto {
    private Long menuId;
    private Long storeId;
    private String menu;
    private Integer price;
    private String imgUrl;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;
}
