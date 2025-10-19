# Security Middleware

보안 헤더 및 정책을 설정하는 미들웨어입니다.

## 기능

- **CSP (Content Security Policy)**: XSS 공격 방어
- **HSTS (HTTP Strict Transport Security)**: HTTPS 강제 사용
- **X-Frame-Options**: 클릭재킹 방어
- **X-Content-Type-Options**: MIME 타입 스니핑 방지
- **CORS (Cross-Origin Resource Sharing)**: 교차 출처 리소스 공유 제어
- **Cookie Security**: 쿠키 보안 옵션 설정

## 사용법

### Vite 개발 서버에서 사용

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { viteSecurityPlugin } from './src/middleware/security';

export default defineConfig({
  plugins: [
    viteSecurityPlugin({
      csp: {
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'"],
          'style-src': ["'self'", "'unsafe-inline'"],
        },
      },
    }),
  ],
});
```

### Express/Connect 서버에서 사용

```typescript
import express from 'express';
import { securityMiddleware } from './middleware/security';

const app = express();

app.use(securityMiddleware({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  cors: {
    origin: ['https://example.com'],
    credentials: true,
  },
}));
```

### 커스텀 Response에 보안 헤더 적용

```typescript
import { applySecurityHeaders } from './middleware/security';

const headers = new Headers();
const secureHeaders = applySecurityHeaders(headers, {
  frameOptions: 'SAMEORIGIN',
  contentTypeOptions: true,
});

const response = new Response('Hello', { headers: secureHeaders });
```

### 안전한 쿠키 설정

```typescript
import { formatSecureCookie } from './middleware/security';

const cookieString = formatSecureCookie('sessionId', 'abc123', {
  httpOnly: true,
  secure: true,
  sameSite: 'Strict',
  maxAge: 86400,
});

// Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
```

## 설정 옵션

### CSP (Content Security Policy)

```typescript
{
  csp: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "https://cdn.example.com"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", "data:", "https:"],
      'connect-src': ["'self'", "https://api.example.com"],
      'font-src': ["'self'", "data:"],
      'object-src': ["'none'"],
      'media-src': ["'self'"],
      'frame-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'upgrade-insecure-requests': true,
      'block-all-mixed-content': true,
    },
    reportOnly: false, // true로 설정하면 위반 보고만 하고 차단하지 않음
  }
}
```

### HSTS (HTTP Strict Transport Security)

```typescript
{
  hsts: {
    maxAge: 31536000, // 1년 (초 단위)
    includeSubDomains: true, // 서브도메인 포함
    preload: true, // HSTS preload 리스트 포함
  }
}
```

### X-Frame-Options

```typescript
{
  frameOptions: 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM https://example.com'
}
```

### CORS

```typescript
{
  cors: {
    origin: 'https://example.com', // 문자열
    // 또는
    origin: ['https://example.com', 'https://app.example.com'], // 배열
    // 또는
    origin: (origin) => origin.endsWith('.example.com'), // 함수

    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count'],
    credentials: true,
    maxAge: 86400, // preflight 캐시 시간 (초)
  }
}
```

### Cookie Security

```typescript
{
  cookies: {
    httpOnly: true, // JavaScript에서 접근 불가
    secure: true, // HTTPS에서만 전송
    sameSite: 'Strict', // CSRF 방어 ('Strict' | 'Lax' | 'None')
    domain: '.example.com', // 쿠키 도메인
    path: '/', // 쿠키 경로
    maxAge: 86400, // 쿠키 만료 시간 (초)
  }
}
```

## 환경 변수

```bash
# .env
NODE_ENV=production
ALLOWED_ORIGINS=https://example.com,https://app.example.com
```

## 보안 모범 사례

1. **프로덕션에서는 HTTPS 사용 필수**
   - `secure` 쿠키 옵션 활성화
   - HSTS 헤더 설정

2. **CSP 정책 엄격하게 설정**
   - `'unsafe-inline'`, `'unsafe-eval'` 최소화
   - 필요한 도메인만 whitelist

3. **CORS 출처 제한**
   - 와일드카드(`*`) 사용 지양
   - 특정 도메인만 허용

4. **쿠키 보안 옵션 활성화**
   - HttpOnly: XSS 방어
   - Secure: HTTPS 전송
   - SameSite: CSRF 방어

5. **정기적인 보안 헤더 검증**
   - [Security Headers](https://securityheaders.com/)
   - [Mozilla Observatory](https://observatory.mozilla.org/)

## 테스트

```bash
# 보안 헤더 확인
curl -I https://your-domain.com

# 또는 브라우저 개발자 도구에서 Network 탭 확인
```

## 참고 자료

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [MDN: HTTP Strict Transport Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
