package com.s310.kakaon.domain.alert.service;

import com.s310.kakaon.domain.alert.entity.Alert;
import com.s310.kakaon.domain.alert.repository.AlertRepository;
import com.s310.kakaon.domain.store.entity.AlertRecipient;
import com.s310.kakaon.domain.store.entity.Store;
import com.s310.kakaon.global.exception.ApiException;
import com.s310.kakaon.global.exception.ErrorCode;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailSendingService {

    private final MailService mailservice;
    private final AlertRepository alertRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendAlertMails(Alert alert) {
        //detached된 alert 대신 다시 DB에서 가져오기
        Alert persisted = alertRepository.findById(alert.getId())
                .orElseThrow(() -> new ApiException(ErrorCode.ALERT_NOT_FOUND));

        Store store = persisted.getStore();

        List<AlertRecipient> alertRecipients = store.getAlertRecipient();

        // 메일 내용 구성
        String subject = "[이상거래 탐지 알림] " + persisted.getAlertType().getDescription();
        String htmlContent = buildAlertMailHtml(persisted, store);

        try {
            mailservice.sendAlertMailHtml(store.getMember().getEmail(), subject, htmlContent);

            for (AlertRecipient alertRecipient : alertRecipients) {
                if (Boolean.TRUE.equals(alertRecipient.getActive())) {
                    mailservice.sendAlertMailHtml(alertRecipient.getEmail(), subject, htmlContent);
                }
            }


            persisted.updateEmailSent();

        } catch (Exception e) {
            log.warn("메일 전송 실패", e);
        }
    }

    private String buildAlertMailHtml(Alert alert, Store store) {
        String detectedAt = alert.getDetectedAt().format(DateTimeFormatter.ofPattern("yy.MM.dd HH:mm"));
        String alertTypeDesc = alert.getAlertType().getDescription();
        String description = alert.getDescription() != null ? alert.getDescription().replace("\n", "<br>") : "";
        String uniqueId = java.util.UUID.randomUUID().toString();

        return String.format("""
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>이상거래 탐지 알림</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
                <!-- Preheader to prevent Gmail clipping -->
                <div style="display:none; font-size:1px; color:#333333; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
                    [KaKaON] %s - %s
                    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
                    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
                </div>

                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); margin-top: 20px; margin-bottom: 20px;">
                    
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <!-- Logo -->
                        <div style="margin-bottom: 20px;">
                            <img src="https://postfiles.pstatic.net/MjAyNTExMjBfMTAz/MDAxNzYzNjAzNDM5MTY1.BoXqTA2QMM3mVmBz7PMVmDY286TU3h4QGzM4nXqeUO0g.aixDa-3OHjX2vf0o1nNLW70rNXmXbanPjwY1bYqr_bwg.PNG/logo.png?type=w966" alt="KaKaON" style="height: 50px; width: auto; border: 0; line-height: 100%%; outline: none; text-decoration: none;">
                        </div>
                        <h1 style="margin: 0; font-size: 22px; color: #1a1a1a; letter-spacing: -0.5px;">이상거래 탐지 알림</h1>
                        <p style="margin: 5px 0 0; font-size: 14px; color: #666;">잠재적인 위험 거래가 감지되었습니다.</p>
                    </div>

                    <!-- Warning Box -->
                    <div style="background-color: #fff8e1; border-left: 4px solid #ffc107; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
                        <div style="font-weight: bold; color: #b38600; margin-bottom: 5px; font-size: 16px;">
                            ⚠️ %s
                        </div>
                        <div style="color: #5a4a18; font-size: 14px; line-height: 1.5;">
                            %s
                        </div>
                    </div>

                    <!-- Details Section -->
                    <div style="margin-bottom: 30px;">
                        <table style="width: 100%%; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 14px; width: 100px;">가맹점</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333; font-size: 14px; font-weight: 500;">%s</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 14px;">탐지 유형</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333; font-size: 14px; font-weight: 500;">%s</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 14px;">발생 시각</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333; font-size: 14px;">%s</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #888; font-size: 14px; vertical-align: top;">상세 내용</td>
                                <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #333; font-size: 14px; line-height: 1.6;">%s</td>
                            </tr>
                        </table>
                    </div>

                    <!-- Button -->
                    <div style="text-align: center; margin-bottom: 40px;">
                        <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                            <tr>
                                <td align="center" bgcolor="#fee500" style="border-radius: 6px;">
                                    <a href="https://k13s310.p.ssafy.io/" target="_blank" style="font-size: 16px; font-family: 'Apple SD Gothic Neo', sans-serif; font-weight: bold; color: #191919; text-decoration: none; display: inline-block; padding: 14px 30px; border: 1px solid #fee500; border-radius: 6px; background-color: #fee500;">
                                        이상거래 상세보기
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Footer -->
                    <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
                        <p style="margin: 0 0 5px; font-size: 12px; color: #999;">본 메일은 카카온 이상거래 탐지 시스템에서 자동 발송되었습니다.</p>
                        <p style="margin: 0 0 15px; font-size: 12px; color: #999;">문의: 카카온 고객센터</p>
                        <p style="margin: 0; font-size: 11px; color: #ccc;">&copy; 2024 KaKaON. All rights reserved.</p>
                        <div style="display:none; color:#ffffff; font-size:1px;">%s</div>
                    </div>
                </div>
            </body>
            </html>
            """,
                alertTypeDesc, detectedAt,
                alertTypeDescriptionMap(alert.getAlertType().name()), // ⚠️ 뒤에 들어갈 문구 (심플한 제목)
                alertTypeDesc, // 경고 박스 본문 (상세 설명)
                store.getName(),
                alertTypeDesc,
                detectedAt,
                description,
                uniqueId
        );
    }

    // AlertType에 따라 간단한 제목을 반환하는 헬퍼 메서드 (필요시 확장)
    private String alertTypeDescriptionMap(String alertTypeName) {
        // 예시 매핑, 실제 Enum 값에 따라 조정 필요할 수 있음. 현재는 Description을 그대로 쓰거나 간단히 매핑
        return switch (alertTypeName) {
            case "SAME_CARD_DIFF_STORE" -> "동일 카드 타지역 결제 감지";
            case "HIGH_AMOUNT" -> "고액 결제 감지";
            case "OFF_HOURS" -> "영업 외 시간 결제 감지";
            case "FREQUENCY" -> "빈도 급증 감지";
            default -> "이상 거래 감지";
        };
    }
}
