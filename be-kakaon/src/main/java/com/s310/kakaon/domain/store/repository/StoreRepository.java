package com.s310.kakaon.domain.store.repository;


import com.s310.kakaon.domain.store.entity.Store;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StoreRepository extends JpaRepository<Store, Long> {

    boolean existsByBusinessNumber(String businessNumber);
    Page<Store> findByMemberId(Long memberId, Pageable pageable);

}
