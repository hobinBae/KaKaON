package com.s310.kakaon.domain.order.service;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.menu.entity.Menu;
import com.s310.kakaon.domain.menu.repository.MenuRepository;
import com.s310.kakaon.domain.order.dto.OrderCancelResponseDto;
import com.s310.kakaon.domain.order.dto.OrderRequestDto;
import com.s310.kakaon.domain.order.dto.OrderResponseDto;
import com.s310.kakaon.domain.order.dto.OrderType;
import com.s310.kakaon.domain.order.entity.OrderItem;
import com.s310.kakaon.domain.order.entity.OrderStatus;
import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.order.mapper.OrderMapper;
import com.s310.kakaon.domain.order.repository.OrderRepository;
import com.s310.kakaon.domain.payment.dto.PaymentCreateRequestDto;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.payment.repository.PaymentRepository;
import com.s310.kakaon.domain.payment.service.PaymentService;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService{

    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final StoreRepository storeRepository;
    private final MenuRepository menuRepository;
    private final PaymentService paymentService;
    private final OrderMapper orderMapper;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public OrderResponseDto createOrderAndPayment(Long memberId, Long storeId, OrderRequestDto request) {
        Orders order = createOrder(memberId, storeId, request);

        PaymentCreateRequestDto payRequest = PaymentCreateRequestDto.builder()
                .amount(request.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .delivery(request.getOrderType() == OrderType.DELIVERY)
                .build();

        paymentService.registerPayment(memberId, storeId, order.getOrderId(), payRequest);

        return orderMapper.fromEntity(order, request.getOrderType(), request.getPaymentMethod());
    }

    @Override
    @Transactional
    public Orders createOrder(Long memberId, Long storeId, OrderRequestDto request) {
        memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        if(!store.getMember().getId().equals(memberId)){
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }

        Orders order = orderMapper.toEntity(store, request);

        orderRepository.save(order);

        return order;
    }

    @Override
    @Transactional
    public OrderCancelResponseDto cancelOrder(Long memberId, Long storeId, Long orderId) {
        // 1) 매장 존재 확인
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        // 2) 가맹점 접근 권한 확인
        if (!store.getMember().getId().equals(memberId)) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }

        // 3) 주문 존재 확인
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(ErrorCode.ORDER_NOT_FOUND));

        // 4) 주문 접근 권한 확인
        if (!order.getStore().getId().equals(store.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }

        // 5) 이미 취소된 주문인지 확인
        if(order.getStatus() == OrderStatus.CANCELED){
            throw new ApiException(ErrorCode.ORDER_ALREADY_CANCELED);
        }

        // 결제 ID 확보
        Payment payment = paymentRepository.findByOrder_OrderId(orderId)
                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_NOT_FOUND));
        Long paymentId = payment.getId();

        // payment 삭제하기
        paymentService.deletePayment(memberId, storeId, paymentId);

        // 주문 상태 및 금액, 시간 갱신
        int totalAmount = order.getTotalAmount();
        order.cancel(totalAmount);

        // 주문 품목 soft delete
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                item.delete();
            }
        }

//        // TODO: payment_cancel 테이블에서 responseCode 받아오기
//        PaymentCancel paymentCancel = paymentCancelRepository
//                .findTopByPayment_PaymentIdOrderByCreatedAtDesc(paymentId)
//                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_CANCEL_NOT_FOUND));
//
//        String responseCode = paymentCancel.getResponseCode();

        // 6) 응답 DTO 구성
        return OrderCancelResponseDto.builder()
                .orderId(order.getOrderId())
//                .responseCode(paymentRespCode)
                .status(OrderStatus.CANCELED)
                .totalAmount(totalAmount)
                .paidAmount(0)              // 전액 환불 후 0
                .refundAmount(totalAmount)  // 전액 환불
                .deletedAt(toIso(order.getDeletedAt()))
                .build();
    }

    private String toIso(LocalDateTime dt) {
        return (dt == null) ? null : dt.atOffset(ZoneOffset.UTC).toInstant().toString();
    }
}
