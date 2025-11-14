package com.s310.kakaon.domain.payment.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payment_info")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class PaymentInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_info_id")
    private Long payment_info_id;

    @Column(name = "payment_uuid", nullable = false, length = 100)
    private String paymentUuid;   // 카드번호, 카카오페이 버코드번호 등
}