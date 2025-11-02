package com.s310.kakaon.domain.store.service;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.store.dto.AlertRecipientCreateRequestDto;
import com.s310.kakaon.domain.store.dto.AlertRecipientResponseDto;
import com.s310.kakaon.domain.store.dto.AlertRecipientUpdateRequestDto;
import com.s310.kakaon.domain.store.entity.AlertRecipient;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.mapper.AlertMapper;
import com.s310.kakaon.domain.store.repository.AlertRepository;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertServiceImpl implements AlertService{

    private final AlertRepository alertRepository;
    private final StoreRepository storeRepository;
    private final MemberRepository memberRepository;
    private final AlertMapper alertMapper;

    @Override
    @Transactional
    public AlertRecipientResponseDto registerAlert(Long storeId, Long memberId,
                                                   AlertRecipientCreateRequestDto request) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        //소유자인지 확인
        validateStoreOwner(store, member);

        AlertRecipient alert = alertMapper.toEntity(request, store);

        alertRepository.save(alert);

        return alertMapper.toResponseDto(alert);
    }

    @Override
    @Transactional
    public void deleteAlert(Long storeId, Long memberId, Long id) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        //소유자인지 확인
        validateStoreOwner(store, member);

        alertRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.ALERT_RECIPIENT_NOT_FOUND));

        alertRepository.deleteById(id);
    }

    @Override
    @Transactional
    public AlertRecipientResponseDto updateAlert(Long storeId, Long memberId, Long id, AlertRecipientUpdateRequestDto request) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.USER_NOT_FOUND));

        validateStoreOwner(store, member);

        AlertRecipient alert = alertRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.ALERT_RECIPIENT_NOT_FOUND));

//        if(request.getName() != null){
//            alert.updateName(request.getName());
//        }
//        if(request.getEmail() != null){
//            alert.updateEmail(request.getEmail());
//        }
//        if(request.getPosition() != null){
//            alert.updatePosition(request.getPosition());
//        }
//        if(!alert.getActive().equals(request.getActive())){
//            alert.updateActive(request.getActive());
//        }
        alert.updateFrom(request);

        return alertMapper.toResponseDto(alert);
    }


    private void validateStoreOwner(Store store, Member member) {
        if (!store.getMember().getId().equals(member.getId())) {
//            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }
    }




}
