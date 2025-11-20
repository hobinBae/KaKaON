import csv
import random
from datetime import datetime, timedelta

# 설정
STORE_NAME = "카카온 테스트 매장"
NUM_RECORDS = 100000
START_DATE = datetime(2024, 1, 1)  # 작년 1월 1일부터
END_DATE = datetime.now()

# 결제 수단 (실제 비율 반영)
PAYMENT_METHODS = [
    ("CARD", 45),
    ("KAKAOPAY", 30),
    ("CASH", 20),
    ("TRANSFER", 5)
]

# 금액 범위 설정
AMOUNT_RANGES = [
    (5000, 15000, 40),      # 소액 (40%)
    (15000, 30000, 35),     # 중간 (35%)
    (30000, 50000, 15),     # 중상 (15%)
    (50000, 100000, 8),     # 고액 (8%)
    (100000, 200000, 2)     # 초고액 (2%)
]

# 시간대별 가중치 (점심, 저녁 시간대 집중)
HOUR_WEIGHTS = {
    0: 0.5, 1: 0.3, 2: 0.2, 3: 0.2, 4: 0.3, 5: 0.5,
    6: 1, 7: 2, 8: 3, 9: 4, 10: 5, 11: 8,
    12: 10, 13: 9, 14: 7, 15: 5, 16: 4, 17: 6,
    18: 9, 19: 10, 20: 8, 21: 6, 22: 4, 23: 2
}

def weighted_choice(choices):
    """가중치 기반 랜덤 선택"""
    total = sum(weight for _, weight in choices)
    r = random.uniform(0, total)
    upto = 0
    for choice, weight in choices:
        if upto + weight >= r:
            return choice
        upto += weight
    return choices[-1][0]

def generate_random_datetime(start, end, hour_weights):
    """가중치 기반 랜덤 날짜/시간 생성"""
    # 랜덤 날짜
    delta = end - start
    random_days = random.randint(0, delta.days)
    date = start + timedelta(days=random_days)

    # 가중치 기반 시간 선택
    hours = list(range(24))
    weights = [hour_weights[h] for h in hours]
    hour = random.choices(hours, weights=weights)[0]

    minute = random.randint(0, 59)
    second = random.randint(0, 59)

    return date.replace(hour=hour, minute=minute, second=second, microsecond=0)

def generate_amount():
    """가중치 기반 금액 생성"""
    # 범위 선택
    range_choice = weighted_choice([(i, w) for i, (_, _, w) in enumerate(AMOUNT_RANGES)])
    min_amt, max_amt, _ = AMOUNT_RANGES[range_choice]

    # 금액 생성 (1000원 단위)
    amount = random.randint(min_amt // 1000, max_amt // 1000) * 1000
    return amount

def generate_authorization_no(approval_time, used_numbers):
    """승인번호 생성 (날짜 6자리 + 난수 5자리 = 11자리)"""
    # 날짜 6자리 (yyMMdd)
    date_part = approval_time.strftime("%y%m%d")

    # 난수 5자리 (중복 방지)
    while True:
        random_part = f"{random.randint(0, 99999):05d}"
        auth_no = date_part + random_part
        if auth_no not in used_numbers:
            used_numbers.add(auth_no)
            return auth_no

def main():
    records = []
    used_numbers = set()  # 승인번호 중복 방지

    for i in range(NUM_RECORDS):
        # 기본 정보
        approval_time = generate_random_datetime(START_DATE, END_DATE, HOUR_WEIGHTS)
        amount = generate_amount()
        payment_method = weighted_choice(PAYMENT_METHODS)
        is_delivery = "배달" if random.random() < 0.3 else "매장"

        # 상태 및 취소 정보 (5%는 취소)
        is_cancelled = random.random() < 0.05
        status = "CANCELED" if is_cancelled else "APPROVED"

        # 취소 시간 (취소된 경우, 승인 후 1시간~3일 사이)
        canceled_at = ""
        if is_cancelled:
            cancel_delta = timedelta(
                hours=random.randint(1, 72),
                minutes=random.randint(0, 59)
            )
            canceled_time = approval_time + cancel_delta
            if canceled_time <= END_DATE:
                canceled_at = canceled_time.strftime("%Y-%m-%d %H:%M:%S")

        record = [
            STORE_NAME,
            generate_authorization_no(approval_time, used_numbers),
            amount,
            payment_method,
            status,
            is_delivery,
            approval_time.strftime("%Y-%m-%d %H:%M:%S"),
            canceled_at
        ]
        records.append(record)

    # 승인 시간 순으로 정렬
    records.sort(key=lambda x: x[6])

    # CSV 파일 생성
    output_file = 'payments_100k.csv'
    with open(output_file, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.writer(f)

        # 헤더
        writer.writerow([
            '매장명', '승인번호', '금액', '결제수단', '상태', '배달여부', '승인일시', '취소일시'
        ])

        # 데이터
        writer.writerows(records)

    # 통계 출력
    print(f"✅ CSV 파일 생성 완료: {output_file}")
    print(f"\n📊 생성된 데이터 통계:")
    print(f"- 총 건수: {NUM_RECORDS}건")
    print(f"- 기간: {START_DATE.date()} ~ {END_DATE.date()}")

    # 결제수단별 통계
    print(f"\n결제수단별:")
    for method, _ in PAYMENT_METHODS:
        count = sum(1 for r in records if r[3] == method)
        print(f"  - {method}: {count}건 ({count/NUM_RECORDS*100:.1f}%)")

    # 상태별 통계
    approved = sum(1 for r in records if r[4] == "APPROVED")
    canceled = sum(1 for r in records if r[4] == "CANCELED")
    print(f"\n상태별:")
    print(f"  - 승인: {approved}건 ({approved/NUM_RECORDS*100:.1f}%)")
    print(f"  - 취소: {canceled}건 ({canceled/NUM_RECORDS*100:.1f}%)")

    # 배달/매장 통계
    delivery = sum(1 for r in records if r[5] == "배달")
    store = sum(1 for r in records if r[5] == "매장")
    print(f"\n주문 유형:")
    print(f"  - 배달: {delivery}건 ({delivery/NUM_RECORDS*100:.1f}%)")
    print(f"  - 매장: {store}건 ({store/NUM_RECORDS*100:.1f}%)")

    # 금액 통계
    amounts = [r[2] for r in records]
    print(f"\n금액 통계:")
    print(f"  - 평균: {sum(amounts)//len(amounts):,}원")
    print(f"  - 최소: {min(amounts):,}원")
    print(f"  - 최대: {max(amounts):,}원")
    print(f"  - 총합: {sum(amounts):,}원")

if __name__ == "__main__":
    main()
