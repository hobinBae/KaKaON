package com.s310.kakaon.domain.member.repository;

import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.entity.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    /**
     * provider + providerId로 회원 조회 (OAuth 로그인용)
     */
    Optional<Member> findByProviderAndProviderId(Provider provider, String providerId);

    /**
     * 이메일로 회원 조회
     */
    Optional<Member> findByEmail(String email);

    /**
     * 소프트 삭제되지 않은 회원 전체 조회
     */
    @Query("SELECT m FROM Member m WHERE m.deletedAt IS NULL")
    List<Member> findAllActive();

    /**
     * 소프트 삭제되지 않은 회원 조회 (by id)
     */
    @Query("SELECT m FROM Member m WHERE m.id = :id AND m.deletedAt IS NULL")
    Optional<Member> findActiveById(Long id);

    /**
     * 특정 이메일이 이미 존재하는지 확인
     */
    boolean existsByEmail(String email);
}
