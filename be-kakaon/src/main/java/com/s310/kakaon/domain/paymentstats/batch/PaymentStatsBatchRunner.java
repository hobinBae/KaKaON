package com.s310.kakaon.domain.paymentstats.batch;

import com.s310.kakaon.domain.paymentstats.service.PaymentStatsService;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentStatsBatchRunner {

    private final PaymentStatsService paymentStatsService;
    private final StoreRepository storeRepository;

    /**
     * 매일 새벽 5시 실행
     * 전날 영업 통계 데이터 Redis에 가져와 저장 (백업용)
     * 영업종료 시 redis data PaymentStats에 update
     */
//    @Scheduled(cron = "0 */1 * * * *", zone = "Asia/Seoul")
    @Scheduled(cron = "0 0 5 * * *", zone = "Asia/Seoul")
    @Transactional
    public void runDailyStatsBatch() {
        LocalDate targetDate = LocalDate.now().minusDays(1);
        log.info("Batch Start! {} 매출 통계 저장 시작", targetDate);

        List<Store> stores = storeRepository.findAll();
        if (stores.isEmpty()) {
            log.warn("등록된 매장 없음");
            return;
        }

        for (Store store : stores) {
            try {
                paymentStatsService.saveDailyPaymentStats(store.getId(), targetDate);
                log.info("[{}] {} 매장 통계 저장 완료", store.getId(), targetDate);
            } catch (Exception e) {
                log.error("[{}] 매장 통계 저장 실패 : {}", store.getName(), e.getMessage());
            }
        }
        log.info("Batch End!");

    }

}
