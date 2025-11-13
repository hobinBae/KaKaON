package com.s310.kakaon.domain.menu.entity;

import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "menu")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@SQLRestriction("deleted_at IS NULL")
public class Menu extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "menu_id")
    private Long menuId;

    //    @Column(name = "store_id", nullable = false)
//    private Long storeId;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "name", nullable = false, length = 80)
    private String name;

    @Column(name = "price", nullable = false)
    private Integer price;

    @Column(name = "img_url", length = 255)
    private String imgUrl;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // ====== Business Logic ======
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }

    public void updatePartial(String name, Integer price, String imgUrl) {
        if (name != null && !name.isBlank()) {
            this.name = name.trim();
        }
        if (price != null) {
            this.price = price;
        }
        if (imgUrl != null) {
            this.imgUrl = imgUrl.isBlank() ? null : imgUrl.trim();
        }
    }
}
