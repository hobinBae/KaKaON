package com.s310.kakaon.domain.store.entity;

import com.s310.kakaon.domain.store.dto.AlertRecipientUpdateRequestDto;
import com.s310.kakaon.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
        name = "alert_recipient",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"store_id", "email"})
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Getter
public class AlertRecipient extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "alert_recipient_id")
    private Long id;

    //임시 추가
    @Column(name = "name", nullable = false, length = 30)
    private String name;

    @Column(name = "position", nullable = false, length = 30)
    private String position;

    @Setter
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Builder.Default
    @Column(name = "active", nullable = false)
    private Boolean active = true;

    public void updateName(String name) {
        this.name = name;
    }

    public void updatePosition(String position) {
        this.position = position;
    }

    public void updateEmail(String email) {
        this.email = email;
    }
    public void updateActive(boolean active) {
        this.active = active;
    }
    public void updateFrom(AlertRecipientUpdateRequestDto request){
        if(request.getName() != null) this.name = request.getName();
        if(request.getPosition() != null) this.position = request.getPosition();
        if(request.getEmail() != null) this.email = request.getEmail();
        if(request.getActive() != null) this.active = request.getActive();

    }
}
