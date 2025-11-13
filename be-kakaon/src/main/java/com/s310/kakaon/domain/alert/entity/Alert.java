package com.s310.kakaon.domain.alert.entity;

import com.s310.kakaon.domain.payment.entity.AlertPayment;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.global.entity.BaseEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;
import org.hibernate.annotations.Fetch;

@Entity
@Table(name = "alert")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Getter
public class Alert extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "alert_uuid", nullable = false, length = 20)
    private String alertUuid;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false)
    private AlertType alertType;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "detected_at", nullable = false)
    private LocalDateTime detectedAt;

    @Builder.Default
    @Column(name = "email_sent", nullable = false)
    private Boolean emailSent = false;

    @Builder.Default
    @Column(name = "checked", nullable = false)
    private Boolean checked = false;

    @Column(name = "checked_at")
    private LocalDateTime checkedAt;

    @OneToMany(mappedBy = "alert", cascade = CascadeType.ALL)
    private List<AlertPayment> alertPayments = new ArrayList<>();

    public void addAlertPayments(AlertPayment alertPayment){
        alertPayments.add(alertPayment);
        alertPayment.setAlert(this);
    }

    public void updateChecked(){
        this.checked = true;
        this.checkedAt = LocalDateTime.now();
    }

    public void updateEmailSent(){
        this.emailSent = true;
    }
}
