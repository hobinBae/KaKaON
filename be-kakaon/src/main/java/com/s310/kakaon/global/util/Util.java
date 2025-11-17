package com.s310.kakaon.global.util;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;

public class Util {
    public static void validateStoreOwner(Store store, Member member){
        if (!store.getMember().getId().equals(member.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }
    }
}
