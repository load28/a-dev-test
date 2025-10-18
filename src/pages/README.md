# Profile Page Documentation

## Overview

완전한 기능을 갖춘 프로필 페이지 구현으로, 프로필 사진 업로드, 닉네임 변경, 비밀번호 변경 기능을 통합했습니다.

## Files Structure

```
src/
├── pages/
│   ├── ProfilePage.tsx              # 메인 프로필 페이지 컴포넌트
│   ├── ProfilePage.example.tsx      # 사용 예시 및 통합 패턴
│   └── README.md                    # 이 문서
├── components/
│   ├── ProfilePhoto.tsx             # 프로필 사진 업로드 컴포넌트
│   ├── NicknameSection.tsx          # 닉네임 변경 섹션
│   └── PasswordSection.tsx          # 비밀번호 변경 섹션
├── services/
│   └── profileService.ts            # Mock API 서비스
├── types/
│   └── profile.ts                   # TypeScript 타입 정의
└── styles.css                       # 글로벌 스타일 (ProfilePhoto CSS 포함)
```

## Features

### 1. ProfilePage Component (`src/pages/ProfilePage.tsx`)

#### 주요 기능
- ✅ 프로필 데이터 로딩 및 에러 처리
- ✅ 로딩 상태 UI (스피너)
- ✅ 에러 상태 UI (재시도 버튼 포함)
- ✅ 전체 페이지 레이아웃 및 헤더
- ✅ 프로필 정보 바 (이메일, 마지막 수정 시간)
- ✅ 새로고침 기능
- ✅ 전역 에러 메시지 표시
- ✅ 세 가지 컴포넌트 통합 (Photo, Nickname, Password)

#### 상태 관리
```typescript
const [profile, setProfile] = useState<UserProfile | null>(null)
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [isRefreshing, setIsRefreshing] = useState(false)
```

#### API 통합
- `fetchUserProfile()`: 초기 프로필 데이터 로드
- `updateNickname()`: 닉네임 업데이트
- `updatePassword()`: 비밀번호 변경
- `uploadProfilePhoto()`: 프로필 사진 업로드

### 2. Mock API Service (`src/services/profileService.ts`)

#### 구현된 API 함수

```typescript
// 프로필 조회
fetchUserProfile(): Promise<UserProfile>

// 닉네임 업데이트
updateNickname(data: UpdateNicknameRequest): Promise<UserProfile>

// 비밀번호 변경
updatePassword(data: UpdatePasswordRequest): Promise<void>

// 프로필 사진 업로드
uploadProfilePhoto(file: File): Promise<UpdatePhotoResponse>

// 프로필 사진 삭제
deleteProfilePhoto(): Promise<void>

// Mock 데이터 리셋 (테스트용)
resetMockData(): void
```

#### Mock 데이터 특징
- 실제 네트워크 지연 시뮬레이션 (500ms ~ 1500ms)
- 랜덤 에러 시뮬레이션
  - 네트워크 에러 (5% 확률)
  - 닉네임 중복 에러 (10% 확률)
  - 잘못된 비밀번호 (15% 확률)
  - 업로드 실패 (5% 확률)
- 파일 유효성 검사 (형식, 크기)
- In-memory 데이터 저장

### 3. UI/UX Features

#### 로딩 상태
- 초기 로딩: 중앙에 스피너와 메시지
- 새로고침: 버튼에 스피너 아이콘 회전

#### 에러 처리
- 전역 에러: 페이지 상단에 배너 표시 (닫기 가능)
- 컴포넌트 에러: 각 섹션에서 자체 처리
- 재시도 기능: 로딩 실패 시 재시도 버튼 제공

#### 반응형 디자인
- Tailwind CSS 활용
- 모바일, 태블릿, 데스크톱 지원
- 최대 너비 4xl (max-w-4xl)로 가독성 최적화

#### 접근성
- ARIA 라벨 사용
- 키보드 네비게이션 지원
- 명확한 에러 메시지
- 색상 대비 고려

## Usage Examples

### Basic Usage

```tsx
import { ProfilePage } from './pages/ProfilePage'
import './styles.css'

function App() {
  return <ProfilePage />
}
```

### With React Router

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ProfilePage } from './pages/ProfilePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}
```

### With Authentication Guard

```tsx
function ProtectedProfile() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <ProfilePage />
}
```

더 많은 예시는 `ProfilePage.example.tsx` 파일을 참고하세요.

## Component Integration

### ProfilePhoto Component
- 프로필 사진 미리보기
- 파일 선택 및 업로드
- 파일 유효성 검사 (형식, 크기)
- 에러 처리 및 표시
- 업로드 진행 상태

### NicknameSection Component
- 닉네임 인라인 편집
- 실시간 유효성 검사
- 키보드 단축키 (Enter: 저장, Escape: 취소)
- 저장 진행 상태 표시

### PasswordSection Component
- 비밀번호 강도 표시기
- 실시간 유효성 검사
- 비밀번호 보기/숨기기 토글
- 일치 여부 확인
- 성공/실패 메시지

## Styling

### CSS Classes

ProfilePhoto 컴포넌트용 CSS 클래스가 `src/styles.css`에 정의되어 있습니다:

- `.profile-photo-container`: 메인 컨테이너
- `.profile-photo-wrapper`: 사진 래퍼 (원형)
- `.profile-photo-image`: 프로필 이미지
- `.profile-photo-default`: 기본 아바타
- `.profile-photo-controls`: 버튼 컨트롤
- `.profile-photo-error`: 에러 메시지

### Customization

Tailwind CSS 유틸리티 클래스를 사용하여 쉽게 커스터마이징 가능합니다:

```tsx
<ProfilePhoto
  currentPhotoUrl={profile.photoUrl}
  onUpload={handlePhotoUpload}
  className="custom-photo-styles"
/>
```

## API Response Types

### UserProfile
```typescript
interface UserProfile {
  id: string
  email: string
  nickname: string
  photoUrl?: string
  createdAt: string
  updatedAt: string
}
```

### Error Codes
```typescript
enum ProfileErrorCode {
  INVALID_NICKNAME
  NICKNAME_ALREADY_EXISTS
  INVALID_PASSWORD
  PASSWORD_TOO_WEAK
  CURRENT_PASSWORD_INCORRECT
  INVALID_PHOTO_FORMAT
  PHOTO_TOO_LARGE
  UPLOAD_FAILED
  UNAUTHORIZED
  NOT_FOUND
  NETWORK_ERROR
  UNKNOWN_ERROR
}
```

## Testing

### Mock Data Reset

테스트 전에 Mock 데이터를 초기화하려면:

```typescript
import { resetMockData } from './services/profileService'

beforeEach(() => {
  resetMockData()
})
```

### Error Simulation

Mock API는 자동으로 랜덤 에러를 시뮬레이션하지만, 특정 에러를 테스트하려면 서비스 함수를 수정하여 에러 확률을 조정할 수 있습니다.

## Performance Considerations

1. **이미지 최적화**: 프로필 사진은 5MB 제한
2. **지연 로딩**: 초기 로딩 시 필요한 데이터만 가져옴
3. **에러 경계**: 컴포넌트 레벨 에러 처리로 전체 앱 크래시 방지
4. **메모이제이션**: 필요시 React.memo() 적용 가능

## Browser Support

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)

## Dependencies

- React 18+
- TypeScript 4.5+
- Tailwind CSS 3+
- lucide-react (아이콘)

## Future Enhancements

- [ ] 프로필 사진 크롭 기능
- [ ] 다크 모드 지원
- [ ] 다국어 지원 (i18n)
- [ ] 프로필 데이터 캐싱
- [ ] 오프라인 지원
- [ ] 애니메이션 효과 추가
- [ ] 유닛 테스트 작성
- [ ] E2E 테스트 작성

## License

MIT

## Support

문제가 있거나 질문이 있으시면 이슈를 생성해주세요.
