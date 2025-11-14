package com.s310.kakaon.domain.alert.service;

import com.s310.kakaon.domain.alert.dto.*;
import com.s310.kakaon.domain.alert.entity.Alert;
import com.s310.kakaon.domain.alert.mapper.AlertMapper;
import com.s310.kakaon.domain.alert.repository.AlertRepository;
import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.payment.dto.PaymentSimpleResponseDto;
import com.s310.kakaon.domain.payment.entity.AlertPayment;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.payment.repository.AlertPaymentRepository;
import com.s310.kakaon.domain.payment.repository.PaymentRepository;
import com.s310.kakaon.domain.store.entity.AlertRecipient;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.dto.PageResponse;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertServiceImpl implements AlertService{
    private final AlertRepository alertRepository;
    private final StoreRepository storeRepository;
    private final MemberRepository memberRepository;
    private final PaymentRepository paymentRepository;
    private final AlertMapper alertMapper;

    @Override
    @Transactional
    public Alert createAlert(AlertEvent event) {
        Store store = storeRepository.findById(event.getStoreId())
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        Alert alert = alertMapper.fromAlertEvent(event, store);

        if(event.getPaymentId() != null){
            Payment payment = paymentRepository.findById(event.getPaymentId())
                    .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));

            AlertPayment alertPayment = AlertPayment.builder()
                    .payment(payment)
                    .alert(alert)
                    .build();

            alert.addAlertPayments(alertPayment);
        }

        alertRepository.save(alert);

        return alert;
    }


    @Override
    @Transactional(readOnly = true)
    public PageResponse<AlertResponseDto> getAnomalyAlerts(Long storeId, Long memberId, AlertSearchRequestDto request, Pageable pageable) {

        memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        Page<Alert> alerts = alertRepository.searchAlerts(store, request, pageable);

        Page<AlertResponseDto> responsePage = alerts.map(alertMapper::fromEntity);

        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public AlertDetailResponseDto getAnomalyAlert(Long memberId, Long storeId, Long id) {

         memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.ALERT_NOT_FOUND));
      storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        List<PaymentSimpleResponseDto> paymentDtos = alert.getAlertPayments().stream()
                .map(alertPayment -> {
                    Payment payment = alertPayment.getPayment();
                    return PaymentSimpleResponseDto.builder()
                            .paymentId(payment.getId())
                            .orderId(payment.getOrder().getOrderId())
                            .authorizationNo(payment.getAuthorizationNo())
                            .amount(payment.getAmount())
                            .paymentMethod(payment.getPaymentMethod())
                            .build();
                })
                .collect(Collectors.toList());


        return AlertDetailResponseDto.builder()
                .id(alert.getId())
                .alertUuid(alert.getAlertUuid())
                .alertType(alert.getAlertType())
                .detectedAt(alert.getDetectedAt())
                .checked(alert.getChecked())
                .emailSent(alert.getEmailSent())
                .description(alert.getDescription())
                .payments(paymentDtos)
                .build();
    }

    @Override
    @Transactional
    public PageResponse<AlertResponseDto> checkedAnomalyAlerts(Long storeId, Long memberId, Pageable pageable) {

        memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        Page<Alert> alerts = alertRepository.findByStore(store, pageable);

        alerts.forEach(Alert::updateChecked);

        Page<AlertResponseDto> responsePage = alerts.map(alertMapper::fromEntity);

        return PageResponse.from(responsePage);

    }

    @Override
    @Transactional
    public AlertResponseDto checkedAnomalyAlert(Long memberId, Long storeId, Long id) {
        memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> new ApiException(ErrorCode.ALERT_NOT_FOUND));

        alert.updateChecked();
        return alertMapper.fromEntity(alert);

    }

    @Override
    @Transactional(readOnly = true)
    public AlertUnreadCountResponseDto getUnreadAlertCount(Long memberId, Long storeId) {

        memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

//        List<Alert> alerts = alertRepository.findByStore(store);

        // N + 1 문제 생김
//        int count = 0;
//
//        for (Alert alert : alerts) {
//            if(!alert.getChecked()){
//                count++;
//            }
//        }
        Long count = alertRepository.countUnreadByStore(store);

        return AlertUnreadCountResponseDto.builder()
                .unreadCount(count)
                .build();
    }
}
