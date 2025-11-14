package com.s310.kakaon.domain.payment.service;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.payment.dto.PaymentInfoRequestDto;
import com.s310.kakaon.domain.payment.dto.PaymentInfoResponseDto;
import com.s310.kakaon.domain.payment.entity.PaymentInfo;
import com.s310.kakaon.domain.payment.mapper.PaymentInfoMapper;
import com.s310.kakaon.domain.payment.repository.PaymentInfoRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PaymentInfoServiceImpl implements PaymentInfoService{

    private final PaymentInfoRepository paymentInfoRepository;
    private final PaymentInfoMapper paymentInfoMapper;
    private final MemberRepository memberRepository;

    /**
     * 결제 수단 등록
     */
    @Override
    @Transactional
    public PaymentInfoResponseDto registerPaymentInfo(Long memberId, PaymentInfoRequestDto request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        // 중복 확인
        if (paymentInfoRepository.existsByPaymentUuid(request.getPaymentUuid())) {
            throw new ApiException(ErrorCode.PAYMENT_INFO_ALREADY_EXISTS);
        }

        PaymentInfo paymentInfo = paymentInfoMapper.toEntity(request);
        PaymentInfo savedPaymentInfo = paymentInfoRepository.save(paymentInfo);

        log.info("결제 수단 등록 완료: {}", savedPaymentInfo.getPaymentUuid());
        return paymentInfoMapper.fromEntity(savedPaymentInfo);
    }

    /**
     * 결제 수단 목록 조회
     */
    @Override
    public List<PaymentInfoResponseDto> getAllPaymentInfos() {
        List<PaymentInfo> paymentInfos = paymentInfoRepository.findAll();

        return paymentInfos.stream()
                .map(paymentInfoMapper::fromEntity)
                .collect(Collectors.toList());
    }
}
