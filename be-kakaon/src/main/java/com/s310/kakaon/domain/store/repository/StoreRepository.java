package com.s310.kakaon.domain.store.repository;


import com.s310.kakaon.domain.store.entity.Store;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StoreRepository extends JpaRepository<Store, Long> {

    boolean existsByBusinessNumber(String businessNumber);

}
