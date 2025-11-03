package com.s310.kakaon.domain.menu.dto;

import com.s310.kakaon.domain.menu.validation.MenuValidationGroups;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuRequestDto {
    @NotBlank(message = "메뉴명은 필수입니다.")
    @NotBlank(groups = MenuValidationGroups.Create.class)
    private String menu;

    @NotNull(message = "가격은 필수입니다.")
    @Min(value = 0, message = "가격은 0 이상이어야 합니다.")
    @NotNull(groups = MenuValidationGroups.Create.class)
    private Integer price;

    private String imgUrl;
}
