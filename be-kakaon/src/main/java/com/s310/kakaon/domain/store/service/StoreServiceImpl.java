package com.s310.kakaon.domain.store.service;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.store.dto.BusinessHourDto;
import com.s310.kakaon.domain.store.dto.StoreCreateRequestDto;
import com.s310.kakaon.domain.store.dto.StoreResponseDto;

import com.s310.kakaon.domain.store.entity.BusinessHour;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.mapper.StoreMapper;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoreServiceImpl implements StoreService{

    private final MemberRepository memberRepository;
    private final StoreRepository storeRepository;
    private final StoreMapper storeMapper;

    @Override
    @Transactional
    public StoreResponseDto registerStore(Long memberId, StoreCreateRequestDto request) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        if(storeRepository.existsByBusinessNumber(request.getBusinessNumber())){
            throw new ApiException(ErrorCode.BUSINESS_NUMBER_ALREADY_EXISTS);
        }

        Store store = storeMapper.toEntity(request, member);

        storeRepository.save(store);

        return storeMapper.toResponseDto(store);

    }

    @Override
    @Transactional(readOnly = true)
    public StoreResponseDto findStoreById(Long memberId, Long storeId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        if (!store.getMember().getId().equals(member.getId())) {
//            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS); // 추가 예정
        }

        return storeMapper.toResponseDto(store);
    }

    @Override
    public void deleteStore(Long storeId) {

    }

    @Override
    public List<StoreResponseDto> getMyStores(Long memberId) {
        return List.of();
    }
}
