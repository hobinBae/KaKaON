package com.s310.kakaon.domain.payment.batch;

import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.payment.repository.PaymentRepository;
import com.s310.kakaon.domain.paymentstats.entity.PaymentStats;
import com.s310.kakaon.domain.paymentstats.entity.PaymentStatsHourly;
import com.s310.kakaon.domain.paymentstats.repository.PaymentStatsHourlyRepository;
import com.s310.kakaon.domain.paymentstats.repository.PaymentStatsRepository;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Payment 엔티티를 DB에 저장하고 통계를 업데이트하는 Writer
 * Chunk 단위로 일괄 처리합니다.
 */
@Component
@StepScope
@RequiredArgsConstructor
@Slf4j
public class PaymentCsvItemWriter implements ItemWriter<Payment> {

    private final PaymentRepository paymentRepository;
    private final PaymentStatsRepository paymentStatsRepository;
    private final PaymentStatsHourlyRepository paymentStatsHourlyRepository;
    private final StoreRepository storeRepository;
    private final EntityManager entityManager;

    @Value("#{jobParameters['storeId']}")
    private Long storeId;

    @Override
    public void write(Chunk<? extends Payment> chunk) throws Exception {
        List<? extends Payment> payments = chunk.getItems();

        if (payments.isEmpty()) {
            return;
        }

        // 1. Payment 배치 저장
        paymentRepository.saveAll(payments);
        log.info("Payment 저장 완료: {}건", payments.size());

        // 2. Store 조회
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        // 3. 통계 메모리 캐시
        Map<LocalDate, PaymentStats> statsCache = new HashMap<>();
        Map<String, PaymentStatsHourly> hourlyCache = new HashMap<>();

        // 4. 각 Payment에 대해 통계 집계
        for (Payment payment : payments) {
            updateStatsInMemory(
                    statsCache,
                    hourlyCache,
                    store,
                    payment
            );
        }

        // 5. 통계 일괄 저장
        saveStatsInBatch(statsCache, hourlyCache);

        // 6. Persistence Context 초기화 (메모리 해제)
        entityManager.flush();
        entityManager.clear();

        log.info("통계 업데이트 완료: PaymentStats={}건, Hourly={}건",
                statsCache.size(), hourlyCache.size());
    }

    /**
     * Payment 정보를 메모리 Stats 캐시에 집계
     */
    private void updateStatsInMemory(
            Map<LocalDate, PaymentStats> statsCache,
            Map<String, PaymentStatsHourly> hourlyCache,
            Store store,
            Payment payment
    ) {
        LocalDate paymentDate = payment.getApprovedAt().toLocalDate();
        int hour = payment.getApprovedAt().getHour();

        // PaymentStats 메모리 집계
        PaymentStats stats = statsCache.computeIfAbsent(paymentDate, d ->
                paymentStatsRepository.findByStoreIdAndStatsDate(storeId, d)
                        .orElseGet(() -> PaymentStats.builder()
                                .store(store)
                                .statsDate(d)
                                .totalSales(0)
                                .totalCancelSales(0)
                                .salesCnt(0L)
                                .cancelCnt(0L)
                                .build())
        );

        // PaymentStatsHourly 메모리 집계
        String hourlyKey = paymentDate + "_" + hour;
        PaymentStatsHourly hourly = hourlyCache.computeIfAbsent(hourlyKey, k -> {
            if (stats.getId() != null) {
                return paymentStatsHourlyRepository.findByPaymentStatsIdAndHour(stats.getId(), hour)
                        .orElseGet(() -> createNewHourly(stats, hour));
            } else {
                return createNewHourly(stats, hour);
            }
        });

        // 메모리에서 집계
        stats.applyPayment(payment.getAmount(), payment.getPaymentMethod(), payment.getDelivery());
        hourly.applyPaymentHourly(payment.getAmount());

        // 취소 처리
        if (payment.getStatus().name().equals("CANCELED")) {
            stats.applyCancel(payment.getAmount(), payment.getPaymentMethod(), payment.getDelivery());
            hourly.applyCancelHourly(payment.getAmount());
        }
    }

    /**
     * 새로운 PaymentStatsHourly 생성
     */
    private PaymentStatsHourly createNewHourly(PaymentStats stats, int hour) {
        return PaymentStatsHourly.builder()
                .paymentStats(stats)
                .hour(hour)
                .hourlyTotalSales(0)
                .hourlyPaymentCount(0)
                .hourlyCancelCount(0)
                .hourlyCancelRate(0.0)
                .build();
    }

    /**
     * 메모리에서 집계된 Stats를 DB에 일괄 저장
     */
    private void saveStatsInBatch(
            Map<LocalDate, PaymentStats> statsCache,
            Map<String, PaymentStatsHourly> hourlyCache
    ) {
        // PaymentStats 일괄 저장
        if (!statsCache.isEmpty()) {
            List<PaymentStats> statsList = new ArrayList<>(statsCache.values());
            paymentStatsRepository.saveAll(statsList);
            entityManager.flush();
        }

        // PaymentStatsHourly 일괄 저장
        if (!hourlyCache.isEmpty()) {
            List<PaymentStatsHourly> hoursList = new ArrayList<>(hourlyCache.values());
            paymentStatsHourlyRepository.saveAll(hoursList);
            entityManager.flush();
        }
    }
}
