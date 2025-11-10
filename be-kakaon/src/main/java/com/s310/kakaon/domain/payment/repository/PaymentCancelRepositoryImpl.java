package com.s310.kakaon.domain.payment.repository;

import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.s310.kakaon.domain.payment.dto.CancelRateAnomalyDto;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.s310.kakaon.domain.payment.entity.QPayment;
import com.s310.kakaon.domain.payment.entity.QPaymentCancel;
import com.s310.kakaon.domain.store.entity.QStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class PaymentCancelRepositoryImpl implements PaymentCancelRepositoryCustom {

    private final JPAQueryFactory query;


    @Override
    public List<CancelRateAnomalyDto> getWeeklyCancelStats() {
        QPayment p = QPayment.payment;
        QPaymentCancel pc = QPaymentCancel.paymentCancel;
        QStore s = QStore.store;

        // ✅ 현재 시각 기준
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourAgo = now.minusHours(1);

        // ✅ 전주 동일 시간 구간
        LocalDateTime lastWeekStart = oneHourAgo.minusWeeks(1);
        LocalDateTime lastWeekEnd = now.minusWeeks(1);

        // ✅ 이번주 최근 1시간 취소율
        List<Tuple> thisHour = query
                .select(p.store.id, s.name, pc.id.count().doubleValue(), p.id.count().doubleValue())
                .from(p)
                .join(p.store, s)
                .leftJoin(pc).on(pc.payment.eq(p))
                .where(p.canceledAt.between(oneHourAgo, now))
                .groupBy(p.store.id, s.name)
                .fetch();

        // ✅ 전주 동일 시간대 취소율
        List<Tuple> lastWeekHour = query
                .select(p.store.id, s.name, pc.id.count().doubleValue(), p.id.count().doubleValue())
                .from(p)
                .join(p.store, s)
                .leftJoin(pc).on(pc.payment.eq(p))
                .where(p.canceledAt.between(lastWeekStart, lastWeekEnd))
                .groupBy(p.store.id, s.name)
                .fetch();

        // ✅ Map으로 변환 (가맹점별 취소율 %)
        Map<Long, Double> thisHourRate = thisHour.stream()
                .collect(Collectors.toMap(
                        t -> t.get(p.store.id),
                        t -> (t.get(pc.id.count().doubleValue()) / t.get(p.id.count().doubleValue())) * 100
                ));

        Map<Long, Double> lastWeekRate = lastWeekHour.stream()
                .collect(Collectors.toMap(
                        t -> t.get(p.store.id),
                        t -> (t.get(pc.id.count().doubleValue()) / t.get(p.id.count().doubleValue())) * 100
                ));

        // ✅ DTO 변환
        return thisHourRate.keySet().stream()
                .map(storeId -> new CancelRateAnomalyDto(
                        storeId,
                        thisHour.stream()
                                .filter(t -> t.get(p.store.id).equals(storeId))
                                .findFirst()
                                .map(t -> t.get(s.name))
                                .orElse("가맹점 이름"),
                        lastWeekRate.getOrDefault(storeId, 0.0),
                        thisHourRate.getOrDefault(storeId, 0.0)
                ))
                .toList();
    }
}
