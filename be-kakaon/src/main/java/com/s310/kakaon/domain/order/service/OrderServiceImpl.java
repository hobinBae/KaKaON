package com.s310.kakaon.domain.order.service;

import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.menu.repository.MenuRepository;
import com.s310.kakaon.domain.order.dto.*;
import com.s310.kakaon.domain.order.entity.OrderItem;
import com.s310.kakaon.domain.order.entity.OrderStatus;
import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.order.mapper.OrderMapper;
import com.s310.kakaon.domain.order.repository.OrderRepository;
import com.s310.kakaon.domain.payment.dto.PaymentCreateRequestDto;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.payment.entity.PaymentCancel;
import com.s310.kakaon.domain.payment.repository.PaymentCancelRepository;
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
    private final PaymentCancelRepository paymentCancelRepository;

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
        paymentService.deletePayment(memberId, paymentId);

        // 주문 상태 및 금액, 시간 갱신
        int totalAmount = order.getTotalAmount();
        order.cancel(totalAmount);

        // 주문 품목 soft delete
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                item.delete();
            }
        }

        PaymentCancel paymentCancel = paymentCancelRepository
                .findByPaymentId(paymentId)
                .orElseThrow(() -> new ApiException(ErrorCode.PAYMENT_CANCEL_NOT_FOUND));
        String responseCode = paymentCancel.getResponseCode();

        // 6) 응답 DTO 구성
        return OrderCancelResponseDto.builder()
                .orderId(order.getOrderId())
                .responseCode(responseCode)
                .status(OrderStatus.CANCELED)
                .totalAmount(totalAmount)
                .paidAmount(0)              // 전액 환불 후 0
                .refundAmount(totalAmount)  // 전액 환불
                .deletedAt(toIso(order.getDeletedAt()))
                .build();
    }

    @Transactional
    public OrderDetailResponseDto getOrderDetail(Long memberId, Long orderId) {
        // 1) 주문 + 매장 + 품목(+메뉴)까지 한 번에
        Orders order = orderRepository.findByIdWithStoreItemsAndMenu(orderId)
                .orElseThrow(() -> new ApiException(ErrorCode.ORDER_NOT_FOUND));

        // 2) 권한(해당 매장 점주만)
        if (!order.getStore().getMember().getId().equals(memberId)) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }

        // 3) 결제 조회 (없을 수도 있음: CREATED 상태)
        Payment payment = paymentRepository.findByOrder_OrderId(orderId).orElse(null);
        String orderType = (payment != null && Boolean.TRUE.equals(payment.getDelivery()))
                ? "DELIVERY" : "STORE";
        String paymentMethod = (payment != null) ? payment.getPaymentMethod().name() : null;

        // 4) 아이템 매핑
        var items = order.getOrderItems().stream()
                .map(oi -> OrderItemResponseDto.builder()
                        .orderItemId(oi.getId())
                        .menuId(oi.getMenu().getMenuId())
                        .menuName(oi.getMenu().getName())
                        .price(oi.getMenu().getPrice())        // 단가는 메뉴의 가격
                        .imgUrl(oi.getMenu().getImgUrl())
                        .quantity(oi.getQuantity())
                        .totalPrice(oi.getTotalPrice())
                        .createdAt(toIso(oi.getCreatedDateTime()))
                        .updatedAt(toIso(oi.getLastModifiedDateTime()))
                        .deletedAt(toIso(oi.getDeletedAt()))
                        .build())
                .toList();

        // 5) 본문 DTO
        return OrderDetailResponseDto.builder()
                .orderId(order.getOrderId())
                .storeId(order.getStore().getId())
                .storeName(order.getStore().getName())
                .status(order.getStatus().name())
                .orderType(orderType)                  // payment 기준
                .paymentMethod(paymentMethod)          // payment 기준
                .totalAmount(order.getTotalAmount())
                .paidAmount(order.getPaidAmount())
                .refundedAmount(order.getRefundedAmount())
                .createdAt(toIso(order.getCreatedDateTime()))
                .updatedAt(toIso(order.getLastModifiedDateTime()))
                .deletedAt(toIso(order.getDeletedAt()))
                .items(items)
                .build();
    }

    private String toIso(LocalDateTime dt) {
        return (dt == null) ? null : dt.atOffset(ZoneOffset.UTC).toInstant().toString();
    }
}
