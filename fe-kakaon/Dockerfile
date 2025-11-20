# ---------- BUILD STAGE ----------
FROM node:20-alpine AS builder
WORKDIR /app

# package.json + lock 파일만 복사해서 캐시 활용 
# (의존성 파일만 먼저 복사해서 Docker 레이어 캐시를 활용.)
COPY package*.json ./

# lock 기반으로 완전 동일한 의존성 설치
RUN npm ci

# 소스 복사 후 빌드
COPY . .
RUN npm run build  # dist/ 폴더에 정적 산출물 생성

# ---------- RUN STAGE ----------
FROM nginx:1.27-alpine

# Nginx의 기본 문서 루트
# : 정적 파일을 여기에 배치하면 자동 서빙됨.
WORKDIR /usr/share/nginx/html

# nginx 설정 파일 복사
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# 빌드 결과물 복사
COPY --from=builder /app/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
