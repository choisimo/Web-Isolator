# 프로젝트별 Nginx 설정 파일

이 디렉터리에는 각 프로젝트별 Nginx 설정 파일이 자동으로 생성됩니다.

## 파일 명명 규칙
- `{project-name}.conf`: 프로젝트별 설정 파일
- 예: `my-blog.conf`, `api-server.conf`

## 자동 생성 예시

### React 프로젝트 설정
```nginx
server {
    listen 80;
    server_name my-blog.local;
    
    location / {
        proxy_pass http://my-blog_web:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### FastAPI 프로젝트 설정
```nginx
server {
    listen 80;
    server_name api.my-blog.local;
    
    location / {
        proxy_pass http://my-blog_api:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 주의사항
- 이 디렉터리의 파일들은 `isolator` CLI에 의해 자동으로 관리됩니다.
- 수동으로 편집하지 마세요. CLI가 다시 덮어쓸 수 있습니다.
- 커스텀 설정이 필요한 경우 프로젝트의 docker-compose.yml을 수정하세요.