package com.s310.kakaon.domain.payment.repository;

import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.s310.kakaon.domain.payment.dto.PaymentSearchRequestDto;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.payment.entity.QPayment;
import com.s310.kakaon.domain.store.entity.Store;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
@AllArgsConstructor
public class PaymentRepositoryImpl implements PaymentRepositoryCustom {

    private final JPAQueryFactory jpaQueryFactory;

    /**
     * 필터링 조건을 적용하여 결제 내역을 페이지네이션 조회
     *
     * @param store
     * @param searchDto
     * @param pageable
     */
    @Override
    public Page<Payment> searchPayments(Store store, PaymentSearchRequestDto searchDto, Pageable pageable) {

        QPayment payment = QPayment.payment;

        BooleanBuilder builder = buildConditions(payment, store, searchDto);

        List<Payment> payments = jpaQueryFactory
                .selectFrom(payment)
                .where(builder)
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .orderBy(payment.approvedAt.desc())
                .fetch();

        long total = jpaQueryFactory
                .select(payment.count())
                .from(payment)
                .where(builder)
                .fetchOne();

        return new PageImpl<>(payments, pageable, total);


    }

    /**
     * 필터링 조건을 적용하여 결제 내역을 전체 조회 (CSV 다운로드용)
     *
     * @param store
     * @param searchDto
     */
    @Override
    public List<Payment> searchPaymentsForExport(Store store, PaymentSearchRequestDto searchDto) {
        QPayment payment = QPayment.payment;

        BooleanBuilder builder = buildConditions(payment, store, searchDto);

        return jpaQueryFactory
                .selectFrom(payment)
                .where(builder)
                .orderBy(payment.approvedAt.desc())
                .fetch();
    }

    /**
     * 공통 조건 빌더
     */
    private BooleanBuilder buildConditions(QPayment payment, Store store, PaymentSearchRequestDto searchDto) {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(payment.store.eq(store));

        if(searchDto.getStartDate() != null) {
            builder.and(payment.approvedAt.goe(searchDto.getStartDate().atStartOfDay()));
        }
        if(searchDto.getEndDate() != null) {
            builder.and(payment.approvedAt.loe(searchDto.getEndDate().atTime(23, 59, 59)));
        }
        if(searchDto.getPaymentMethod() != null) {
            builder.and(payment.paymentMethod.eq(searchDto.getPaymentMethod()));
        }
        if(searchDto.getStatus() != null) {
            builder.and(payment.status.eq(searchDto.getStatus()));
        }
        if(searchDto.getIsDelivery() != null) {
            builder.and(payment.delivery.eq(searchDto.getIsDelivery()));
        }
        if(searchDto.getAuthorizationNo() != null && !searchDto.getAuthorizationNo().isEmpty()) {
            builder.and(payment.authorizationNo.contains(searchDto.getAuthorizationNo()));
        }

        return builder;
    }

    @Override
    public Double findAveragePaymentAmountLastMonth(Store store) {
        QPayment payment = QPayment.payment;

        LocalDate now = LocalDate.now();
        LocalDate firstDayOfLastMonth = now.minusMonths(1).withDayOfMonth(1);
        LocalDate lastDayOfLastMonth = now.withDayOfMonth(1).minusDays(1);

        Double avgAmount = jpaQueryFactory
                .select(payment.amount.avg())
                .from(payment)
                .where(
                        payment.store.eq(store),
                        payment.approvedAt.between(
                                firstDayOfLastMonth.atStartOfDay(),
                                lastDayOfLastMonth.atTime(23, 59, 59)
                        )
                )
                .fetchOne();

        return avgAmount != null ? avgAmount : 0.0;
    }

}
