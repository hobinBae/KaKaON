package com.s310.kakaon.domain.store.entity;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.store.dto.BusinessType;
import com.s310.kakaon.domain.store.dto.OperationStatus;
import com.s310.kakaon.domain.store.dto.StoreStatus;
import com.s310.kakaon.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.Where;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "store")
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@EqualsAndHashCode(of = "id", callSuper = false)
@ToString(exclude = "member")
@SQLRestriction("deleted_at IS NULL")
public class Store extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "store_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Member member;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "business_number", nullable = false, unique = true, length = 30)
    private String businessNumber;

    //여기는 enum으로 할 수 있음
    @Enumerated(EnumType.STRING)
    @Column(name = "business_type", nullable = false, length = 30)
    private BusinessType businessType;

    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Column(name = "phone", nullable = false, length = 100)
    private String phone;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "postal_code", nullable = false, length = 30)
    private String postalCode;

    @Column(name = "latitude", precision = 10, scale = 7, nullable = false)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7, nullable = false)
    private BigDecimal longitude;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private StoreStatus status = StoreStatus.OPEN;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    private OperationStatus operationStatus = OperationStatus.CLOSED;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder.Default
    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BusinessHour> businessHours = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AlertRecipient> alertRecipient = new ArrayList<>();

    public void updateName(String name){
        this.name = name;
    }

    public void updateBusinessType(BusinessType businessType){
        this.businessType = businessType;
    }

    public void updatePhone(String phone){
        this.phone = phone;
    }


    public void updateOperationStatus(OperationStatus status) {
        this.operationStatus = status;
    }

    public void addBusinessHour(BusinessHour businessHour) {
        businessHours.add(businessHour);
        businessHour.setStore(this);
    }

    public void updateBusinessHours(List<BusinessHour> newBusinessHours){
        this.businessHours.clear();
        for(BusinessHour bh : newBusinessHours){
            this.addBusinessHour(bh);
        }
    }

    public void addAlertRecipient(AlertRecipient recipient) {
        alertRecipient.add(recipient);
        recipient.setStore(this);
    }

    public void delete() {
        this.deletedAt = LocalDateTime.now();
        this.status = StoreStatus.CLOSED;
    }
}

