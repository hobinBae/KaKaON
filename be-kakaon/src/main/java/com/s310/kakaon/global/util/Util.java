package com.s310.kakaon.global.util;

import com.s310.kakaon.domain.alert.repository.AlertRepository;
import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RequiredArgsConstructor
public class Util {

    private final AlertRepository alertRepository;
    private static final SecureRandom RANDOM = new SecureRandom();

    public static void validateStoreOwner(Store store, Member member){
        if (!store.getMember().getId().equals(member.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }
    }

    public static String generateAlertId(AlertRepository alertRepository) {
        String prefix = "ALERT-";
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddss"));

        while (true) {
            int randomPart = RANDOM.nextInt(1_000_000); // 0~999999
            String alertUuid = prefix + datePart + String.format("%06d", randomPart);

            if (!alertRepository.existsByAlertUuid(alertUuid)) {
                return alertUuid;
            }
        }

    }

}
