package com.s310.kakaon.domain.payment.mapper;

import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.payment.dto.PaymentCreateRequestDto;
import com.s310.kakaon.domain.payment.dto.PaymentResponseDto;
import com.s310.kakaon.domain.payment.dto.PaymentStatus;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.store.entity.Store;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class PaymentMapper {

    public PaymentResponseDto fromEntity(Payment payment){
        return PaymentResponseDto.builder()
                .paymentId(payment.getId())
                .storeId(payment.getStore().getId())
                .orderId(payment.getOrder().getOrderId())
                .storeName(payment.getStore().getName())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .approvedAt(payment.getApprovedAt())
                .authorizationCode(payment.getAuthorizationNo())
                .build();
    }

    public Payment toEntity(Store store, Orders order, String authorizationNo, PaymentCreateRequestDto request){
        return Payment.builder()
                .store(store)
                .order(order)
                .authorizationNo(authorizationNo)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.APPROVED)
                .approvedAt(LocalDateTime.now())
                .delivery(Boolean.TRUE.equals(request.getDelivery()))
                .build();
    }



}
