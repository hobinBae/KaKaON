package com.s310.kakaon.domain.order.service;

import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.order.dto.*;
import com.s310.kakaon.domain.order.entity.OrderItem;
import com.s310.kakaon.domain.order.entity.OrderStatus;
import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.order.mapper.OrderMapper;
import com.s310.kakaon.domain.order.repository.OrderItemRepository;
import com.s310.kakaon.domain.order.repository.OrderRepository;
import com.s310.kakaon.domain.payment.dto.PaymentCreateRequestDto;
import com.s310.kakaon.domain.payment.dto.PaymentMethod;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.payment.entity.PaymentCancel;
import com.s310.kakaon.domain.payment.repository.PaymentCancelRepository;
import com.s310.kakaon.domain.payment.repository.PaymentRepository;
import com.s310.kakaon.domain.payment.service.PaymentService;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import jakarta.persistence.criteria.Predicate;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService{

    private final OrderRepository orderRepository;
    private final MemberRepository memberRepository;
    private final StoreRepository storeRepository;
    private final PaymentService paymentService;
    private final OrderMapper orderMapper;
    private final PaymentRepository paymentRepository;
    private final PaymentCancelRepository paymentCancelRepository;
    private final OrderItemRepository orderItemRepository;

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

        order.updateStatus(request.getTotalAmount());

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
                .deletedAt(toIso(order.getDeletedAt(), null))
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
                        .createdAt(toIso(oi.getCreatedDateTime(), null))
                        .updatedAt(toIso(oi.getLastModifiedDateTime(), null))
                        .deletedAt(toIso(oi.getDeletedAt(), null))
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
                .createdAt(toIso(order.getCreatedDateTime(), null))
                .updatedAt(toIso(order.getLastModifiedDateTime(), null))
                .deletedAt(toIso(order.getDeletedAt(), null))
                .items(items)
                .build();
    }

    @Transactional
    public OrderListResponseDto getRecentOrderList(
            Long memberId,
            Long storeId,
            Integer page,
            Integer size,
            String status,
            String paymentMethod,
            String orderType
    ) {

        // 0) 매장 존재 + 접근 권한 확인
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));
        if (!store.getMember().getId().equals(memberId)) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }


        // 1) 날짜 범위 계산: today 23:59:59.999… 까지 포함되도록 [start, end)
        // end = (today + 1일) 00:00, start = end - 7일 → today 포함 "최근 7일"
        ZoneId zone = ZoneId.of("Asia/Seoul");
        LocalDate today = LocalDate.now();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        LocalDateTime start = end.minusDays(7);

        // 2) 최신순 정렬 (createdDateTime DESC, orderId DESC)
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.max(size, 1),
                Sort.by(Sort.Order.desc("createdDateTime"), Sort.Order.desc("orderId"))
        );

        // 3) Specification 구성
        Specification<Orders> spec = (root, query, cb) -> {
            List<Predicate> preds = new ArrayList<>();
            preds.add(cb.equal(root.get("store").get("id"), storeId));
            preds.add(cb.greaterThanOrEqualTo(root.get("createdDateTime"), start));
            preds.add(cb.lessThan(root.get("createdDateTime"), end));

            if (status != null) {
                preds.add(cb.equal(root.get("status"), status));
            }

            // 결제기반 필터(paymentMethod, orderType)는 EXISTS 서브쿼리로 처리
            if (paymentMethod != null || orderType != null) {
                Subquery<Long> sq = query.subquery(Long.class);
                Root<Payment> p = sq.from(Payment.class);
                List<Predicate> sp = new ArrayList<>();
                sp.add(cb.equal(p.get("order").get("orderId"), root.get("orderId")));
                if (paymentMethod != null) sp.add(cb.equal(p.get("paymentMethod"), paymentMethod));
                if (orderType != null) {
                    Path<Boolean> isDelivery = p.get("delivery");
                    sp.add(orderType.equals(OrderType.DELIVERY.name()) ? cb.isTrue(isDelivery) : cb.isFalse(isDelivery));
                }
                sq.select(p.get("id")).where(sp.toArray(new Predicate[0]));
                preds.add(cb.exists(sq));
            }

            return cb.and(preds.toArray(new Predicate[0]));
        };
        Page<Orders> pageData = orderRepository.findAll(spec, pageable);

        // 4) 배치 로딩 (N+1 방지)
        List<Long> orderIds = pageData.getContent().stream()
                .map(Orders::getOrderId)
                .toList();

        Map<Long, Payment> paymentByOrder = paymentRepository.findByOrder_OrderIdIn(orderIds)
                .stream()
                .collect(Collectors.toMap(
                        p -> p.getOrder().getOrderId(),
                        Function.identity(),
                        (a, b) -> a
                ));

        Map<Long, List<OrderItem>> itemsByOrder = orderItemRepository
                .findByOrder_OrderIdIn(orderIds)
                .stream()
                .collect(Collectors.groupingBy(oi -> oi.getOrder().getOrderId()));

        // 5) DTO 매핑
        List<OrderListResponseDto.OrderSummary> content = pageData.getContent().stream()
                .map(o -> {
                    Payment pay = paymentByOrder.get(o.getOrderId());
                    OrderType ot = (pay != null && Boolean.TRUE.equals(pay.getDelivery()))
                            ? OrderType.DELIVERY : OrderType.STORE;
                    PaymentMethod pm = (pay != null) ? pay.getPaymentMethod() : null;

                    List<OrderItemResponseDto> items = itemsByOrder
                            .getOrDefault(o.getOrderId(), List.of())
                            .stream()
                            .map(oi -> OrderItemResponseDto.builder()
                                    .orderItemId(oi.getId())
                                    .menuId(oi.getMenu().getMenuId())
                                    .menuName(oi.getMenu().getName())
                                    .price(oi.getMenu().getPrice())
                                    .imgUrl(oi.getMenu().getImgUrl())
                                    .quantity(oi.getQuantity())
                                    .totalPrice(oi.getTotalPrice())
                                    .createdAt(toIso(oi.getCreatedDateTime(), zone))
                                    .updatedAt(toIso(oi.getLastModifiedDateTime(), zone))
                                    .deletedAt(toIso(oi.getDeletedAt(), zone))
                                    .build())
                            .toList();

                    return OrderListResponseDto.OrderSummary.builder()
                            .orderId(o.getOrderId())
                            .storeId(o.getStore().getId())
                            .storeName(o.getStore().getName())
                            .status(o.getStatus().name())
                            .orderType(ot.name())
                            .paymentMethod(pm.name())
                            .totalAmount(o.getTotalAmount())
                            .paidAmount(o.getPaidAmount())
                            .refundedAmount(o.getRefundedAmount())
                            .createdAt(toIso(o.getCreatedDateTime(), zone))
                            .updatedAt(toIso(o.getLastModifiedDateTime(), zone))
                            .deletedAt(toIso(o.getDeletedAt(), zone))
                            .itemsCount(items.size())
                            .items(items)
                            .build();
                })
                .toList();

        return OrderListResponseDto.builder()
                .content(content)
                .page(pageData.getNumber())
                .size(pageData.getSize())
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .build();
    }

    private String toIso(LocalDateTime dt, ZoneId zoneId) {
        if(dt == null){
            return null;
        }
        if(zoneId==null){
            return dt.atOffset(ZoneOffset.UTC).toInstant().toString();
        }
        return dt.atZone(zoneId).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
    }
}
