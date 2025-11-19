package com.s310.kakaon.global.config;

import com.s310.kakaon.domain.payment.batch.PaymentCsvItemProcessor;
import com.s310.kakaon.domain.payment.batch.PaymentCsvItemWriter;
import com.s310.kakaon.domain.payment.dto.PaymentCsvDto;
import com.s310.kakaon.domain.payment.entity.Payment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.file.FlatFileItemReader;
import org.springframework.batch.item.file.builder.FlatFileItemReaderBuilder;
import org.springframework.batch.item.file.mapping.BeanWrapperFieldSetMapper;
import org.springframework.batch.item.file.transform.DelimitedLineTokenizer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.FileSystemResource;
import org.springframework.transaction.PlatformTransactionManager;

import java.beans.PropertyEditorSupport;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@Configuration
@EnableBatchProcessing
@RequiredArgsConstructor
@Slf4j
public class BatchConfig {

    private static final int CHUNK_SIZE = 2000;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Bean
    public Job paymentCsvUploadJob(
            JobRepository jobRepository,
            Step paymentCsvUploadStep
    ) {
        return new JobBuilder("paymentCsvUploadJob", jobRepository)
                .start(paymentCsvUploadStep)
                .build();
    }

    @Bean
    public Step paymentCsvUploadStep(
            JobRepository jobRepository,
            PlatformTransactionManager transactionManager,
            FlatFileItemReader<PaymentCsvDto> paymentCsvItemReader,
            PaymentCsvItemProcessor processor,
            PaymentCsvItemWriter writer
    ) {
        return new StepBuilder("paymentCsvUploadStep", jobRepository)
                .<PaymentCsvDto, Payment>chunk(CHUNK_SIZE, transactionManager)
                .reader(paymentCsvItemReader)
                .processor(processor)
                .writer(writer)
                .faultTolerant()
                .skip(Exception.class)
                .skipLimit(100)
                .build();

    }

    /**
     * CSV 파일을 읽는 ItemReader
     * @StepScope를 사용하여 JobParameters에서 파일 경로를 주입받습니다.
     *
     * @param filePath CSV 파일 경로 (JobParameters로 전달)
     */
    @Bean
    @StepScope
    public FlatFileItemReader<PaymentCsvDto> paymentCsvItemReader(
            @Value("#{jobParameters['filePath']}") String filePath
    ) {
        return new FlatFileItemReaderBuilder<PaymentCsvDto>()
                .name("paymentCsvItemReader")
                .resource(new FileSystemResource(filePath))
                .encoding("UTF-8")
                .linesToSkip(1) // 헤더 라인 스킵
                .lineTokenizer(new DelimitedLineTokenizer() {{
                    setNames("storeName", "authorizationNo", "amount", "paymentMethod", "status", "deliveryType", "approvedAt", "canceledAt");
                    setDelimiter(",");
                    setQuoteCharacter('"');
                }})
                .fieldSetMapper(new BeanWrapperFieldSetMapper<>() {{
                    setTargetType(PaymentCsvDto.class);
                    setCustomEditors(Map.of(
                            LocalDateTime.class, new PropertyEditorSupport() {
                                @Override
                                public void setAsText(String text) {
                                    if (text == null || text.trim().isEmpty()) {
                                        setValue(null);
                                    } else {
                                        setValue(LocalDateTime.parse(text.trim(), FORMATTER));
                                    }
                                }
                            }
                    ));
                }})
                .build();
    }

}
