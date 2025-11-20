package com.s310.kakaon.domain.menu.repository;

import com.s310.kakaon.domain.menu.entity.Menu;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuRepository extends JpaRepository<Menu, Long> {
    Page<Menu> findByStore_IdAndDeletedAtIsNull(Long storeId, Pageable pageable);
}
