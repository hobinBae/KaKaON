//package com.s310.kakaon.domain.file.service;
//
//
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//import software.amazon.awssdk.core.sync.RequestBody;
//import software.amazon.awssdk.services.s3.S3Client;
//import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
//import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
//import software.amazon.awssdk.services.s3.model.PutObjectRequest;
//
//import java.io.IOException;
//import java.util.UUID;
//
//@Service
//@RequiredArgsConstructor
//@Slf4j
//public class S3FileStorageService implements FileStorageService {
//
//    private final S3Client s3Client;
//
//    @Value("${app.aws.s3.bucket}")
//    private String bucket;
//
//    @Value("${app.aws.s3.base-url}")
//    private String baseUrl;
//
//    @Override
//    public String uploadMenuImage(Long storeId, MultipartFile file) {
//        // S3에 저장될 key (폴더 구조)
//        String key = "menus/" + storeId + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();
//
//        try {
//            PutObjectRequest putReq = PutObjectRequest.builder()
//                    .bucket(bucket)
//                    .key(key)
//                    .acl(ObjectCannedACL.PUBLIC_READ)   // 퍼블릭 읽기
//                    .contentType(file.getContentType())
//                    .build();
//
//            s3Client.putObject(
//                    putReq,
//                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
//            );
//
//            // DB에 저장할 URL
//            return baseUrl + "/" + key;
//        } catch (IOException e) {
//            log.error("S3 메뉴 이미지 업로드 실패, key={}", key, e);
//            throw new RuntimeException("메뉴 이미지 업로드 실패", e);
//        }
//    }
//
//    @Override
//    public void deleteFile(String fileUrl) {
//        // https://.../menus/1/xxx.jpg  ->  menus/1/xxx.jpg
//        String key = fileUrl.replace(baseUrl + "/", "");
//
//        DeleteObjectRequest delReq = DeleteObjectRequest.builder()
//                .bucket(bucket)
//                .key(key)
//                .build();
//
//        s3Client.deleteObject(delReq);
//    }
//}