package com.s310.kakaon.domain.alert.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;

    public void sendAlertMail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("메일 전송 성공 : {}", to);
        } catch (Exception e) {
            log.error("메일 전송 실패 : {}", e.getMessage(), e);
        }
    }

    public void sendAlertMailHtml(String to, String subject, String htmlBody) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true enables HTML

            mailSender.send(mimeMessage);
            log.info("HTML 메일 전송 성공 : {}", to);
        } catch (Exception e) {
            log.error("HTML 메일 전송 실패 : {}", e.getMessage(), e);
        }
    }
}
