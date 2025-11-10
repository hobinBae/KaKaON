package com.s310.kakaon.domain.store.service;

import com.s310.kakaon.domain.alert.dto.UnreadCountProjection;
import com.s310.kakaon.domain.alert.repository.AlertRepository;
import com.s310.kakaon.domain.member.entity.Member;
import com.s310.kakaon.domain.member.repository.MemberRepository;
import com.s310.kakaon.domain.payment.repository.PaymentRepository;
import com.s310.kakaon.domain.store.dto.*;

import com.s310.kakaon.domain.store.entity.BusinessHour;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.domain.store.mapper.StoreMapper;
import com.s310.kakaon.domain.store.repository.StoreRepository;
import com.s310.kakaon.global.dto.PageResponse;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class StoreServiceImpl implements StoreService{

    private final MemberRepository memberRepository;
    private final StoreRepository storeRepository;
    private final AlertRepository alertRepository;
    private final PaymentRepository paymentRepository;
    private final StoreMapper storeMapper;

    private static final String REDIS_KEY_PREFIX = "store:operation:startTime:";

    private final StringRedisTemplate stringRedisTemplate;

    @Override
    @Transactional
    public StoreDetailResponseDto registerStore(Long memberId, StoreCreateRequestDto request) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        if(storeRepository.existsByBusinessNumber(request.getBusinessNumber())){
            throw new ApiException(ErrorCode.BUSINESS_NUMBER_ALREADY_EXISTS);
        }

        Store store = storeMapper.toEntity(request, member);

        storeRepository.save(store);

        return storeMapper.fromEntity(store);

    }

    @Override
    @Transactional(readOnly = true)
    public StoreDetailResponseDto findStoreById(Long memberId, Long storeId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        validateStoreOwner(store, member);

        return storeMapper.fromEntity(store);
    }

    @Override
    @Transactional
    public OperationStatusUpdateResponseDto updateOperationStatus(Long memberId, Long storeId, OperationStatusUpdateRequestDto request){
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        validateStoreOwner(store, member);

        OperationStatus newStatus = request.getStatus();
        store.updateOperationStatus(newStatus);

        String redisKey = REDIS_KEY_PREFIX + storeId;

        //레디스에 영업 시작 시간을 저장
        //영업종료를 누르면 레디스에 시작 시간 삭제
        if (request.getStatus().equals(OperationStatus.CLOSED)) {
            stringRedisTemplate.delete(redisKey);
            log.info("[영업 종료] Redis 키 삭제: {}", redisKey);
            //여기 배치 실행 메서드 넣으면 될듯
        }else if(request.getStatus().equals(OperationStatus.OPEN)){
            Double avgAmount = paymentRepository.findAveragePaymentAmountLastMonth(store);

            Map<String, String> data = new HashMap<>();

            data.put("startTime", LocalDateTime.now().toString());
            data.put("avgPaymentAmountPrevMonth", String.valueOf(avgAmount));

            stringRedisTemplate.opsForHash().putAll(redisKey, data);
            log.info("[영업 시작] storeId={}, 전월 평균 결제금액={}", store.getId(), avgAmount);
            //여기는 redis 관련 로직 넣으면 될듯
        }

        return OperationStatusUpdateResponseDto.builder()
                .updatedAt(LocalDateTime.now())
                .status(store.getOperationStatus())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public OperationStatusUpdateResponseDto getOperationStatus(Long memberId, Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        if(store.getOperationStatus().equals(OperationStatus.CLOSED)){
            return OperationStatusUpdateResponseDto.builder()
                    .updatedAt(null)
                    .status(store.getOperationStatus())
                    .build();
        }else{
            String redisKey = REDIS_KEY_PREFIX + storeId;
            String startTimeStr = stringRedisTemplate.opsForValue().get(redisKey);

            LocalDateTime updatedAt;
            try {
                // Redis 값이 있으면 파싱
                updatedAt = (startTimeStr != null) ? LocalDateTime.parse(startTimeStr) : store.getLastModifiedDateTime();
            } catch (DateTimeParseException e) {
                // 혹시 Redis 값이 깨져 있으면 DB 변경시간으로 처리
                log.warn("[STORE {}] Redis 영업 시작 시각 파싱 실패, DB updatedDateTime으로 대체", storeId);
                updatedAt = store.getLastModifiedDateTime();
            }

            return OperationStatusUpdateResponseDto.builder()
                    .updatedAt(updatedAt)
                    .status(store.getOperationStatus())
                    .build();
        }

    }

    @Override
    @Transactional
    public void deleteStore(Long memberId, Long storeId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        validateStoreOwner(store, member);

        store.delete();

    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<StoreResponseDto> getMyStores(Long memberId, Pageable pageable) {

         memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));

        Page<Store> stores = storeRepository.findByMemberId(memberId, pageable);

        List<UnreadCountProjection> unreadCounts =
                alertRepository.countUnreadByMemberIdGroupedByStore(memberId);

        Map<Long, Long> unreadCountMap = unreadCounts.stream()
                .collect(Collectors.toMap(
                        UnreadCountProjection::getStoreId,
                        UnreadCountProjection::getUnreadCount
                ));

        Page<StoreResponseDto> responsePage = stores.map(store -> {
            Long unreadCount = unreadCountMap.getOrDefault(store.getId(), 0L);
            return storeMapper.toResponseDto(store, unreadCount);
        });

        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional
    public StoreDetailResponseDto updateStore(Long memberId, Long storeId, StoreUpdateRequestDto request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ApiException(ErrorCode.MEMBER_NOT_FOUND));
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new ApiException(ErrorCode.STORE_NOT_FOUND));

        validateStoreOwner(store, member);
        if(request.getName() != null){
            store.updateName(request.getName());
        }

        if (request.getPhone() != null) {
            store.updatePhone(request.getPhone());
        }

        if(request.getBusinessType() != null){
            store.updateBusinessType(request.getBusinessType());
        }

        if (request.getBusinessHours() != null) {
            List<BusinessHour> newBusinessHours = request.getBusinessHours().stream()
                    .map(dto -> BusinessHour.builder()
                            .dayOfWeek(dto.getDayOfWeek())
                            .openTime(dto.isClosed() ? null : LocalTime.parse(dto.getOpenTime()))
                            .closeTime(dto.isClosed() ? null : LocalTime.parse(dto.getCloseTime()))
                            .closed(dto.isClosed())
                            .build())
                    .toList();
            store.updateBusinessHours(newBusinessHours);
        }

        return storeMapper.fromEntity(store);
    }

    private void validateStoreOwner(Store store, Member member) {
        if (!store.getMember().getId().equals(member.getId())) {
            throw new ApiException(ErrorCode.FORBIDDEN_ACCESS);
        }
    }
}
