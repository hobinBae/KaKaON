package com.s310.kakaon.global.config;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.order.entity.Orders;
import com.s310.kakaon.domain.order.entity.OrderStatus;
import com.s310.kakaon.domain.order.repository.OrderRepository;
import com.s310.kakaon.domain.payment.dto.PaymentMethod;
import com.s310.kakaon.domain.payment.dto.PaymentStatus;
import com.s310.kakaon.domain.payment.entity.Payment;
import com.s310.kakaon.domain.payment.repository.PaymentRepository;
import com.s310.kakaon.domain.store.dto.BusinessType;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!prod") // 프로덕션 환경에서는 실행하지 않음
public class DataInitializer implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final StoreRepository storeRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final JwtTokenProvider jwtTokenProvider;

    private final Random random = new Random();
    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 이미 데이터가 있으면 스킵
        if (paymentRepository.count() > 0) {
            log.info("더미 데이터가 이미 존재합니다. 초기화를 건너뜁니다.");
            return;
        }

        log.info("=== 더미 데이터 생성 시작 ===");

        // 1. 테스트 회원 생성
        Member member = createTestMember();
        log.info("테스트 회원 생성 완료: {}", member.getName());

        // 2. 테스트 매장 생성
        Store store = createTestStore(member);
        log.info("테스트 매장 생성 완료: {}", store.getName());

        // 3. 주문 및 결제 데이터 50개 생성 (2025년 날짜)
        createPaymentsData(store, 50);

        // 4. 테스트용 JWT 토큰 생성 및 출력
        String accessToken = jwtTokenProvider.createAccessToken(member.getProviderId(), member.getRole().name());
        String refreshToken = jwtTokenProvider.createRefreshToken(member.getProviderId());

        log.info("=== 더미 데이터 생성 완료 (총 50개 결제) ===");
        log.info("========================================");
        log.info("테스트 유저 정보:");
        log.info("  - Member ID: {}", member.getId());
        log.info("  - Store ID: {}", store.getId());
        log.info("  - Store Name: {}", store.getName());
        log.info("  - Provider ID (kakaoId): {}", member.getProviderId());
        log.info("========================================");
        log.info("테스트용 Access Token:");
        log.info("{}", accessToken);
        log.info("========================================");
        log.info("테스트용 Refresh Token:");
        log.info("{}", refreshToken);
        log.info("========================================");
    }

    private Member createTestMember() {
        return memberRepository.save(Member.builder()
                .name("테스트 매장주")
                .email("test@example.com")
                .provider(com.s310.kakaon.domain.member.entity.Provider.KAKAO)
                .providerId("test_dummy_user")
                .build());
    }

    private Store createTestStore(Member member) {
        return storeRepository.save(Store.builder()
                .member(member)
                .name("카카온 테스트 매장")
                .businessNumber("123-45-67890")
                .businessType(BusinessType.RESTAURANT)
                .address("서울특별시 강남구 테헤란로 123")
                .phone("02-1234-5678")
                .city("서울")
                .state("강남구")
                .postalCode("06234")
                .latitude(new BigDecimal("37.5012345"))
                .longitude(new BigDecimal("127.0398765"))
                .build());
    }

    private void createPaymentsData(Store store, int count) {
        PaymentMethod[] methods = PaymentMethod.values();
        PaymentStatus[] statuses = {PaymentStatus.APPROVED, PaymentStatus.APPROVED, PaymentStatus.APPROVED, PaymentStatus.CANCELED}; // 75% 승인, 25% 취소
        boolean[] deliveryOptions = {true, false};

        for (int i = 0; i < count; i++) {
            // 2025년 1월 1일 ~ 2025년 11월 5일 사이의 랜덤 날짜
            LocalDateTime approvedAt = generateRandomDate2025();

            // 랜덤 금액 (5,000원 ~ 50,000원)
            int amount = (random.nextInt(46) + 5) * 1000;

            // 랜덤 결제수단, 상태, 배달여부
            PaymentMethod method = methods[random.nextInt(methods.length)];
            PaymentStatus status = statuses[random.nextInt(statuses.length)];
            boolean isDelivery = deliveryOptions[random.nextInt(deliveryOptions.length)];

            // 주문 생성
            Orders order = orderRepository.save(Orders.builder()
                    .store(store)
                    .totalAmount(amount)
                    .paidAmount(status == PaymentStatus.APPROVED ? amount : 0)
                    .refundedAmount(status == PaymentStatus.CANCELED ? amount : 0)
                    .status(status == PaymentStatus.APPROVED ? OrderStatus.CREATED : OrderStatus.CANCELED)
                    .build());

            // 승인번호 생성 (중복 체크)
            String authorizationNo = generateUniqueAuthorizationNo();

            // 결제 생성
            Payment payment = Payment.builder()
                    .store(store)
                    .order(order)
                    .authorizationNo(authorizationNo)
                    .amount(amount)
                    .paymentMethod(method)
                    .status(status)
                    .approvedAt(approvedAt)
                    .canceledAt(status == PaymentStatus.CANCELED ? approvedAt.plusHours(1) : null)
                    .delivery(isDelivery)
                    .build();

            paymentRepository.save(payment);

            if ((i + 1) % 10 == 0) {
                log.info("{}개의 결제 데이터 생성 완료...", i + 1);
            }
        }
    }

    /**
     * 2025년 1월 1일 ~ 2025년 11월 5일 사이의 랜덤 날짜 생성
     */
    private LocalDateTime generateRandomDate2025() {
        LocalDateTime start = LocalDateTime.of(2025, Month.JANUARY, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(2025, Month.NOVEMBER, 5, 23, 59);

        long startEpochSecond = start.toEpochSecond(java.time.ZoneOffset.UTC);
        long endEpochSecond = end.toEpochSecond(java.time.ZoneOffset.UTC);

        long randomEpochSecond = startEpochSecond + (long) (random.nextDouble() * (endEpochSecond - startEpochSecond));

        return LocalDateTime.ofEpochSecond(randomEpochSecond, 0, java.time.ZoneOffset.UTC);
    }

    /**
     * 중복되지 않는 승인번호 생성
     */
    private String generateUniqueAuthorizationNo() {
        String authorizationNo;
        do {
            authorizationNo = generateAuthorizationNo();
        } while (paymentRepository.existsByAuthorizationNo(authorizationNo));
        return authorizationNo;
    }

    /**
     * 승인번호 생성 (yyMMdd + 5자리 랜덤)
     */
    private String generateAuthorizationNo() {
        LocalDateTime now = LocalDateTime.now();
        String datePart = String.format("%02d%02d%02d",
                now.getYear() % 100,
                now.getMonthValue(),
                now.getDayOfMonth());
        int randomPart = secureRandom.nextInt(100_000);
        return datePart + String.format("%05d", randomPart);
    }
}
