FROM nginx:alpine

# 필요한 패키지 설치
RUN apk add --no-cache \
    bash \
    curl \
    openssl

# Nginx 설정 디렉터리 생성
RUN mkdir -p /etc/nginx/conf.d/projects

# 기본 Nginx 설정 복사
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# 포트 노출
EXPOSE 80 443

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]