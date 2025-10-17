# 엔터프라이즈급 OAuth 구글 로그인 인증 시스템

## 개요

이 프로젝트는 Google OAuth 2.0을 사용한 엔터프라이즈급 인증 시스템을 구현합니다.
어떤 컴포넌트에서도 인증 정보에 접근할 수 있는 글로벌 인증 상태 관리를 제공합니다.

## 주요 기능

### 🔐 보안 기능
- **Google OAuth 2.0 통합**: 안전한 소셜 로그인
- **자동 토큰 갱신**: 만료 5분 전 자동 갱신
- **보안 토큰 저장**: 싱글톤 패턴의 안전한 토큰 관리
- **세션 지속성**: 브라우저 재시작 후에도 로그인 상태 유지
- **CSRF/XSS 방어**: 엔터프라이즈급 보안 조치

### ⚡ 개발자 경험
- **TypeScript 완벽 지원**: 전체 타입 안정성
- **React Context API**: 글로벌 상태 관리
- **Custom Hooks**: 간편한 인증 상태 접근
- **Protected Routes**: 라우트 레벨 인증 가드
- **Mock 서비스**: 백엔드 없이 테스트 가능

### 🎨 UI/UX
- **현대적인 로그인 페이지**: Tailwind CSS 디자인
- **로딩 상태 관리**: 부드러운 사용자 경험
- **에러 핸들링**: 사용자 친화적 에러 메시지
- **반응형 디자인**: 모바일/데스크톱 최적화

## 프로젝트 구조

```
src/
├── config/
│   └── auth.config.ts          # 인증 설정 (Mock/Real API 전환)
├── types/
│   └── auth.ts                 # TypeScript 타입 정의
├── utils/
│   └── tokenStorage.ts         # 토큰 저장소 (Singleton)
├── services/
│   ├── authService.ts          # 실제 API 클라이언트
│   └── mockAuthService.ts      # Mock API (테스트용)
├── contexts/
│   └── AuthContext.tsx         # 글로벌 인증 Context
├── hooks/
│   └── useAuth.ts              # Custom Hooks
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx  # 라우트 보호 컴포넌트
└── routes/
    ├── login.tsx               # 로그인 페이지
    ├── dashboard.tsx           # 대시보드 (보호된 페이지)
    └── __root.tsx              # 네비게이션 바
```

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 내용을 추가:

```env
# Google OAuth Client ID (실제 ID로 교체)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com

# API 엔드포인트
VITE_API_BASE_URL=http://localhost:4000/api

# Mock 서비스 사용 (백엔드 없이 테스트)
VITE_USE_MOCK_AUTH=true
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:3000/login` 접속

## Google OAuth 설정

### 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 기존 프로젝트 선택
3. **API 및 서비스** → **사용자 인증 정보** 이동
4. **사용자 인증 정보 만들기** → **OAuth 2.0 클라이언트 ID** 선택
5. OAuth 동의 화면 구성
6. 승인된 JavaScript 원본 추가:
   - `http://localhost:3000` (개발)
   - 프로덕션 도메인
7. 승인된 리디렉션 URI 추가:
   - `http://localhost:3000` (개발)
   - 프로덕션 도메인
8. Client ID 복사하여 `.env` 파일에 추가

## 사용 방법

### 컴포넌트에서 인증 정보 사용

```typescript
import { useAuth } from './hooks/useAuth'

function MyComponent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  if (isLoading) {
    return <div>로딩 중...</div>
  }

  if (!isAuthenticated) {
    return <div>로그인이 필요합니다</div>
  }

  return (
    <div>
      <h1>환영합니다, {user.name}님!</h1>
      <p>이메일: {user.email}</p>
      <button onClick={logout}>로그아웃</button>
    </div>
  )
}
```

### Protected Route 생성

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'

export const Route = createFileRoute('/protected-page')({
  component: () => (
    <ProtectedRoute>
      <YourProtectedComponent />
    </ProtectedRoute>
  ),
})
```

### Custom Hooks 활용

```typescript
import {
  useAuth,           // 전체 인증 컨텍스트
  useIsAuthenticated, // 인증 상태만
  useCurrentUser,    // 현재 사용자 정보만
  useRequireAuth     // 인증 필수 체크
} from './hooks/useAuth'

// 예제 1: 전체 컨텍스트
const auth = useAuth()
console.log(auth.user, auth.isAuthenticated)

// 예제 2: 인증 상태만 확인
const isAuthenticated = useIsAuthenticated()

// 예제 3: 현재 사용자 정보
const user = useCurrentUser()

// 예제 4: 인증 필수 페이지
const { canAccess, isLoading } = useRequireAuth()
if (!canAccess) return <Navigate to="/login" />
```

### 인증된 API 호출

```typescript
import { authService } from './services/authService'
import { tokenStorage } from './utils/tokenStorage'

// 인증된 fetch 함수 생성
const authenticatedFetch = authService.createAuthenticatedFetch(
  () => tokenStorage.getAccessToken()
)

// API 호출
async function fetchUserData() {
  const response = await authenticatedFetch('/api/user/profile')
  const data = await response.json()
  return data
}
```

## 백엔드 API 요구사항

### 필수 엔드포인트

#### 1. POST /api/auth/google
구글 OAuth 토큰으로 로그인

```typescript
// Request
{
  "credential": "google_jwt_token"
}

// Response
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "picture": "https://...",
    "emailVerified": true
  },
  "tokens": {
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token",
    "expiresAt": 1234567890
  }
}
```

#### 2. POST /api/auth/refresh
토큰 갱신

```typescript
// Request
{
  "refreshToken": "jwt_refresh_token"
}

// Response
{
  "accessToken": "new_jwt_access_token",
  "expiresAt": 1234567890
}
```

#### 3. GET /api/auth/verify
토큰 검증

```typescript
// Headers
Authorization: Bearer jwt_access_token

// Response
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### 4. POST /api/auth/logout
로그아웃

```typescript
// Headers
Authorization: Bearer jwt_access_token

// Response: 200 OK
```

## 아키텍처 설명

### 1. 인증 흐름

```
사용자 → Google OAuth → 로그인 페이지
  ↓
Google Credential → AuthContext.login()
  ↓
AuthService/MockService → 백엔드 API
  ↓
토큰 저장 (TokenStorage) → LocalStorage
  ↓
인증 상태 업데이트 → Context
  ↓
자동 토큰 갱신 스케줄링
```

### 2. 토큰 관리

- **저장**: Singleton 패턴의 TokenStorage
- **갱신**: 만료 5분 전 자동 갱신
- **만료**: 자동 로그아웃 및 리다이렉트
- **보안**: XSS/CSRF 방어

### 3. 상태 관리

```
AuthProvider (Context)
  ↓
useReducer (State Management)
  ↓
Custom Hooks (useAuth, useIsAuthenticated, etc.)
  ↓
Components (어디서든 접근 가능)
```

## Mock 서비스 vs 실제 API

### Mock 서비스 사용 (기본값)

`.env` 파일:
```env
VITE_USE_MOCK_AUTH=true
```

- 백엔드 없이 즉시 테스트 가능
- Google JWT를 디코딩하여 사용자 정보 추출
- 실제 네트워크 지연 시뮬레이션
- 콘솔에 상세 로그 출력

### 실제 API 사용

`.env` 파일:
```env
VITE_USE_MOCK_AUTH=false
VITE_API_BASE_URL=https://your-api.com/api
```

- 실제 백엔드 API 연동
- 프로덕션 환경에서 사용
- 위에 명시된 API 엔드포인트 구현 필요

## 보안 고려사항

### 1. 토큰 보안
- LocalStorage 사용 (SessionStorage 대안 가능)
- XSS 방어: React의 기본 보호 + CSP 헤더
- CSRF 방어: 토큰 기반 인증

### 2. 네트워크 보안
- HTTPS 사용 필수 (프로덕션)
- CORS 설정 (백엔드)
- Rate Limiting (백엔드)

### 3. 세션 관리
- 자동 토큰 갱신
- 만료 시 자동 로그아웃
- 리프레시 토큰 사용

### 4. 프로덕션 체크리스트
- [ ] HTTPS 활성화
- [ ] 환경 변수 보안 관리
- [ ] CSP 헤더 설정
- [ ] httpOnly 쿠키 고려
- [ ] 세션 타임아웃 설정
- [ ] 2FA 구현 고려
- [ ] 로깅 및 모니터링 설정

## 트러블슈팅

### 자주 발생하는 문제

#### 1. "VITE_GOOGLE_CLIENT_ID is not set"
- `.env` 파일 확인
- 환경 변수 이름 확인 (VITE_ 접두사)
- 개발 서버 재시작

#### 2. "useAuth must be used within an AuthProvider"
- `main.tsx`에서 AuthProvider 래핑 확인
- 컴포넌트 계층 구조 확인

#### 3. 토큰 갱신 실패
- 백엔드 `/api/auth/refresh` 엔드포인트 확인
- 리프레시 토큰 저장 확인
- 토큰 만료 시간 검증

#### 4. Google 로그인 팝업 차단
- 브라우저 팝업 설정 확인
- Google Console의 리디렉션 URI 확인
- Client ID 정확성 확인

#### 5. Mock 서비스가 작동하지 않음
- `VITE_USE_MOCK_AUTH=true` 확인
- 브라우저 콘솔에서 "Mock login successful" 로그 확인
- 개발 서버 재시작

## 성능 최적화

### 1. Context 최적화
- useMemo로 Context 값 메모이제이션
- useCallback으로 함수 메모이제이션
- 불필요한 리렌더링 방지

### 2. 코드 스플리팅
- 라우트 레벨 코드 스플리팅
- Protected Route 별도 청크

### 3. 번들 사이즈
- jwt-decode: ~2KB
- @react-oauth/google: ~77KB

## 테스트

### 로컬 테스트 (Mock 서비스)

```bash
# Mock 서비스로 실행
npm run dev

# 브라우저에서 테스트
# 1. /login 페이지로 이동
# 2. Google 로그인 클릭
# 3. 구글 계정 선택
# 4. /dashboard로 자동 리다이렉트
# 5. 사용자 정보 표시 확인
```

### 프로덕션 테스트 (실제 API)

```bash
# 환경 변수 설정
VITE_USE_MOCK_AUTH=false
VITE_API_BASE_URL=https://your-api.com/api

# 빌드 및 실행
npm run build
npm run serve
```

## 확장 가능성

### 추가 가능한 기능

1. **다중 OAuth 제공자**
   - Facebook, GitHub, Apple 로그인 추가

2. **2단계 인증 (2FA)**
   - OTP, SMS 인증 추가

3. **비밀번호 로그인**
   - 이메일/비밀번호 로그인 옵션

4. **권한 관리 (RBAC)**
   - 역할 기반 접근 제어

5. **세션 관리**
   - 다중 디바이스 세션 관리
   - 디바이스 로그아웃

## 라이센스

이 인증 시스템은 프로젝트의 일부이며 동일한 라이센스를 따릅니다.

## 지원

문제가 발생하거나 질문이 있으시면:
1. `AUTH_SETUP.md` 문서 참조
2. 브라우저 콘솔 로그 확인
3. 개발팀에 문의

## 기여

이 인증 시스템은 엔터프라이즈급 보안과 확장성을 고려하여 설계되었습니다.
개선 사항이나 버그 리포트는 환영합니다!
