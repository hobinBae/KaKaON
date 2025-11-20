package com.s310.kakaon.domain.file.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {

    // 메뉴 이미지용으로 storeId까지 받는 메서드
    String uploadMenuImage(Long storeId, MultipartFile file);

    // 필요하면 삭제도
    void deleteFile(String fileUrl);
}