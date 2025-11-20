package com.s310.kakaon.domain.payment.repository;

import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.s310.kakaon.domain.payment.dto.CancelRateAnomalyDto;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import com.s310.kakaon.domain.payment.entity.QPayment;
import com.s310.kakaon.domain.payment.entity.QPaymentCancel;
import com.s310.kakaon.domain.store.entity.QStore;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class PaymentCancelRepositoryImpl implements PaymentCancelRepositoryCustom {

    private final JPAQueryFactory query;
    private static final QPayment p = QPayment.payment;
    private static final QPaymentCancel pc = QPaymentCancel.paymentCancel;
    private static final QStore s = QStore.store;

    @Override
    public List<CancelRateAnomalyDto> getWeeklyCancelStats() {


        // ✅ 현재 시각 기준
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneHourAgo = now.minusHours(1);

        // ✅ 전주 동일 시간 구간
        LocalDateTime lastWeekStart = oneHourAgo.minusWeeks(1);
        LocalDateTime lastWeekEnd = now.minusWeeks(1);

        // ✅ 이번주 최근 1시간 취소율
        List<Tuple> thisHour = getCancelStatsBetween(oneHourAgo, now);
        // ✅ 전주 동일 시간대 취소율
        List<Tuple> lastWeekHour = getCancelStatsBetween(lastWeekStart, lastWeekEnd);

        // ✅ Map으로 변환 (가맹점별 취소율 %)
        Map<Long, Double> thisHourRate = getCancelRate(thisHour);
        Map<Long, Double> lastWeekRate = getCancelRate(lastWeekHour);

        Map<Long, String> storeNameMap = Stream.concat(thisHour.stream(), lastWeekHour.stream())
                .collect(Collectors.toMap(
                        t -> t.get(p.store.id),
                        t -> Optional.ofNullable(t.get(s.name)).orElse("가맹점 이름"),
                        (name1, name2) -> name1
                ));
// ✅ DTO 변환
        return thisHourRate.keySet().stream()
                .map(storeId -> new CancelRateAnomalyDto(
                        storeId,
                        storeNameMap.getOrDefault(storeId, "가맹점 이름"),
                        lastWeekRate.getOrDefault(storeId, 0.0),
                        thisHourRate.getOrDefault(storeId, 0.0)
                ))
                .toList();
    }

    public List<Tuple> getCancelStatsBetween(LocalDateTime start, LocalDateTime end) {
        return query
                .select(p.store.id, s.name, pc.id.countDistinct().doubleValue(), p.id.count().doubleValue())
                .from(p)
                .join(p.store, s)
                .leftJoin(pc).on(pc.payment.eq(p))
                .where(p.approvedAt.between(start, end))
                .groupBy(p.store.id, s.name)
                .fetch();

    }

    public Map<Long, Double> getCancelRate(List<Tuple> cancelRate){
        return cancelRate.stream()
                .collect(Collectors.toMap(
                        t -> t.get(p.store.id),
                        t -> {
                            Double cancelCount = Optional.ofNullable(
                                    t.get(pc.id.countDistinct().doubleValue())
                            ).orElse(0.0);
                            Double totalCount = Optional.ofNullable(t.get(p.id.count().doubleValue())).orElse(0.0);
                            return totalCount == 0.0 ? 0.0 : (cancelCount / totalCount) * 100.0;
                        }
                ));
    }

}
