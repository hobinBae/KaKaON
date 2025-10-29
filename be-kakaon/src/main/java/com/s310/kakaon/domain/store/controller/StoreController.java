package com.s310.kakaon.domain.store.controller;

import com.s310.kakaon.domain.store.dto.StoreResponseDto;
import com.s310.kakaon.domain.store.service.StoreService;
import com.s310.kakaon.domain.store.service.StoreServiceImpl;
import com.s310.kakaon.global.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/stores")
@RequiredArgsConstructor
@Slf4j
public class StoreController {

    private final StoreService storeService;

    //jwt 구현 이후 작업
//    @PostMapping
//    public ResponseEntity<ApiResponse<StoreResponseDto>> createStore(
//    )



}
