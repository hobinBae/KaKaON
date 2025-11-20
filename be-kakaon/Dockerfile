# ---------- BUILD STAGE ----------
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /workspace

# 1) Gradle 관련 파일만 먼저 복사 (의존성 캐시용 레이어)
COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle* settings.gradle* ./

RUN chmod +x ./gradlew

# 2) 의존성만 먼저 받아서 /root/.gradle 캐시 레이어 만들기
#   - 실패해도 전체 빌드 막지 않도록 || true
RUN ./gradlew dependencies --no-daemon -x test || true

# 3) 실제 소스 코드만 복사
COPY src ./src

# 4) 최종 jar 빌드 (clean 제거해서 캐시 최대 활용)
RUN ./gradlew bootJar --no-daemon -x test

# ---------- RUN STAGE ----------
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /workspace/build/libs/*SNAPSHOT.jar app.jar
ENV TZ=Asia/Seoul
ENTRYPOINT ["java", "-jar", "app.jar"]