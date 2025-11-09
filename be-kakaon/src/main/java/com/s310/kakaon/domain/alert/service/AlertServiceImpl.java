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
    private final AlertPaymentRepository alertPaymentRepository;
    private final AlertMapper alertMapper;
    private final MailService mailService;


    @Override
    @Transactional
    public void createAndSendAlert(AlertEvent event) {
        Store store = storeRepository.findById(event.getStoreId())
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));
        List<AlertRecipient> alertRecipients = store.getAlertRecipient();

        Alert alert = Alert.builder()
                .alertUuid(event.getAlertUuid())
                .store(store)
                .alertType(event.getAlertType())
                .description(event.getDescription())
                .detectedAt(event.getDetectedAt())
                .emailSent(false)
                .checked(false)
                .build();
        // 메일 내용 구성
        String subject = "[이상거래 탐지 알림] " + alert.getAlertType().getDescription();
        String text = String.format(
                "가맹점: %s\n이상 탐지 유형: %s\n설명: %s\n발생 시각: %s",
                store.getName(),
                alert.getAlertType().getDescription(),
                alert.getDescription(),
                alert.getDetectedAt().format(DateTimeFormatter.ofPattern("yy.MM.dd HH:mm"))
        );
        // 가맹점 이메일로 전송 (Store 엔티티에 email 필드 있다고 가정)
        mailService.sendAlertMail(store.getMember().getEmail(), subject, text);
        alertRepository.save(alert);
        if(event.getPaymentId() != null){

            Payment payment = paymentRepository.findById(event.getPaymentId())
                    .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));

            AlertPayment alertPayment = AlertPayment.builder()
                    .payment(payment)
                    .alert(alert)
                    .build();

            alertPaymentRepository.save(alertPayment);

        }
        if(!alertRecipients.isEmpty()){
            for (AlertRecipient alertRecipient : alertRecipients) {
                if(alertRecipient.getActive()){
                    mailService.sendAlertMail(alertRecipient.getEmail(), subject, text);
                }
            }
        }

        try{
            alert.updateEmailSent();
        }catch(Exception e){
            log.warn("[메일 전송 실패] storeId={}, reason={}", store.getId(), e.getMessage());
        }
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
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        List<PaymentSimpleResponseDto> paymentDtos = alert.getAlertPayments().stream()
                .map(alertPayment -> {
                    Payment payment = alertPayment.getPayment();
                    return PaymentSimpleResponseDto.builder()
                            .paymentId(payment.getId())
                            .authorizationNo(payment.getAuthorizationNo())
                            .amount(payment.getAmount())
                            .paymentMethod(payment.getPaymentMethod())
                            .build();
                })
                .toList();


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

        List<Alert> alerts = alertRepository.findByStore(store);

        int count = 0;

        for (Alert alert : alerts) {
            if(!alert.getChecked()){
                count++;
            }
        }

        return AlertUnreadCountResponseDto.builder()
                .unreadCount(count)
                .build();
    }
}
