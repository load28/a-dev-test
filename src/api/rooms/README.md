# 회의실 예약 API

회의실 예약 생성, 취소, 조회 및 가능한 시간대 확인 기능을 제공하는 API입니다.

## 파일 구조

```
src/api/rooms/
├── booking.ts           # 핵심 비즈니스 로직
├── types.ts            # TypeScript 타입 정의
├── router.example.ts   # Express.js 라우터 예제
└── README.md          # API 문서
```

## 주요 기능

### 1. 예약 생성 (createBooking)

회의실 예약을 생성합니다.

**검증 사항:**
- 필수 정보 확인 (roomId, userId, startTime, endTime, title)
- 날짜 형식 검증
- 예약 가능 시간 체크
- 중복 예약 검증

**엔드포인트:** `POST /api/rooms/:id/book`

**요청 예제:**
```json
{
  "userId": "user123",
  "startTime": "2025-10-20T10:00:00Z",
  "endTime": "2025-10-20T11:00:00Z",
  "title": "팀 미팅",
  "description": "주간 팀 미팅",
  "attendees": ["user1@example.com", "user2@example.com"]
}
```

**응답 예제 (성공):**
```json
{
  "success": true,
  "booking": {
    "id": "booking_1697800000000_abc123",
    "roomId": "room-001",
    "userId": "user123",
    "startTime": "2025-10-20T10:00:00.000Z",
    "endTime": "2025-10-20T11:00:00.000Z",
    "title": "팀 미팅",
    "description": "주간 팀 미팅",
    "attendees": ["user1@example.com", "user2@example.com"],
    "status": "ACTIVE",
    "createdAt": "2025-10-17T14:00:00.000Z",
    "updatedAt": "2025-10-17T14:00:00.000Z"
  }
}
```

**응답 예제 (실패):**
```json
{
  "success": false,
  "error": "이 시간대에 이미 예약이 존재합니다."
}
```

### 2. 예약 취소 (cancelBooking)

기존 예약을 취소합니다.

**검증 사항:**
- 예약 존재 여부
- 권한 확인 (예약한 사용자만 취소 가능)
- 이미 취소된 예약 확인

**엔드포인트:** `DELETE /api/rooms/bookings/:bookingId`

**요청 예제:**
```json
{
  "bookingId": "booking_1697800000000_abc123",
  "userId": "user123"
}
```

**응답 예제 (성공):**
```json
{
  "success": true,
  "message": "예약이 성공적으로 취소되었습니다."
}
```

### 3. 중복 예약 검증 (validateDuplicateBooking)

같은 회의실에 대해 시간이 겹치는 활성 예약이 있는지 확인합니다.

**검증 로직:**
- 같은 회의실의 활성 예약만 확인
- 취소된 예약은 제외
- 시간 겹침 체크 (startTime < otherEndTime && otherStartTime < endTime)

**오류 코드:**
- `DUPLICATE_BOOKING`: 중복 예약이 존재함

### 4. 예약 가능 시간 체크 (validateAvailableTime)

예약 가능한 시간인지 확인합니다.

**검증 사항:**

1. **과거 시간 체크**
   - 과거 시간으로 예약 불가
   - 오류 코드: `PAST_TIME`

2. **시간 범위 유효성**
   - 시작 시간이 종료 시간보다 빨라야 함
   - 오류 코드: `INVALID_TIME_RANGE`

3. **최소 예약 시간 (30분)**
   - 최소 30분 이상 예약해야 함
   - 오류 코드: `MINIMUM_DURATION`

4. **최대 예약 시간 (4시간)**
   - 최대 4시간까지만 예약 가능
   - 오류 코드: `MAXIMUM_DURATION`

5. **운영 시간 체크**
   - 평일 09:00 - 18:00만 예약 가능
   - 주말 예약 불가
   - 같은 날짜 내에서만 예약 가능
   - 오류 코드: `OUTSIDE_OPERATING_HOURS`

### 5. 예약 목록 조회 (getRoomBookings)

특정 회의실의 예약 목록을 조회합니다.

**엔드포인트:** `GET /api/rooms/:id/bookings`

**쿼리 파라미터:**
- `startDate` (선택): 시작 날짜 (ISO 8601)
- `endDate` (선택): 종료 날짜 (ISO 8601)

**응답 예제:**
```json
{
  "success": true,
  "bookings": [
    {
      "id": "booking_1697800000000_abc123",
      "roomId": "room-001",
      "userId": "user123",
      "startTime": "2025-10-20T10:00:00.000Z",
      "endTime": "2025-10-20T11:00:00.000Z",
      "title": "팀 미팅",
      "status": "ACTIVE"
    }
  ],
  "count": 1
}
```

### 6. 예약 가능한 시간대 조회 (getAvailableTimeSlots)

특정 날짜의 예약 가능한 30분 단위 시간대를 조회합니다.

**엔드포인트:** `GET /api/rooms/:id/available-slots`

**쿼리 파라미터:**
- `date` (필수): 조회할 날짜 (ISO 8601)

**응답 예제:**
```json
{
  "success": true,
  "date": "2025-10-20",
  "availableSlots": [
    {
      "startTime": "2025-10-20T09:00:00.000Z",
      "endTime": "2025-10-20T09:30:00.000Z"
    },
    {
      "startTime": "2025-10-20T09:30:00.000Z",
      "endTime": "2025-10-20T10:00:00.000Z"
    }
  ],
  "count": 2
}
```

## 오류 코드

| 코드 | 설명 |
|------|------|
| `DUPLICATE_BOOKING` | 해당 시간대에 이미 예약이 존재함 |
| `PAST_TIME` | 과거 시간으로 예약 불가 |
| `INVALID_TIME_RANGE` | 시작 시간이 종료 시간보다 늦음 |
| `MINIMUM_DURATION` | 최소 예약 시간(30분) 미충족 |
| `MAXIMUM_DURATION` | 최대 예약 시간(4시간) 초과 |
| `OUTSIDE_OPERATING_HOURS` | 운영 시간 외 예약 시도 |

## 운영 정책

- **운영 시간**: 평일 09:00 - 18:00
- **주말**: 예약 불가
- **최소 예약 시간**: 30분
- **최대 예약 시간**: 4시간
- **예약 단위**: 30분
- **당일 예약**: 가능 (단, 과거 시간 불가)
- **예약 취소**: 예약한 본인만 가능

## 사용 예제

### Node.js에서 직접 사용

```typescript
import { createBooking, cancelBooking } from './booking';

// 예약 생성
const result = await createBooking('room-001', {
  userId: 'user123',
  startTime: '2025-10-20T10:00:00Z',
  endTime: '2025-10-20T11:00:00Z',
  title: '팀 미팅',
  description: '주간 팀 미팅',
  attendees: ['user1@example.com', 'user2@example.com']
});

if (result.success) {
  console.log('예약 완료:', result.booking);
} else {
  console.error('예약 실패:', result.error);
}

// 예약 취소
const cancelResult = await cancelBooking({
  bookingId: 'booking_1697800000000_abc123',
  userId: 'user123'
});

if (cancelResult.success) {
  console.log('취소 완료:', cancelResult.message);
}
```

### Express.js 라우터와 함께 사용

`router.example.ts` 파일을 참고하여 Express.js 앱에 라우터를 추가하세요.

```typescript
import express from 'express';
import roomRouter from './api/rooms/router.example';

const app = express();
app.use(express.json());
app.use('/api/rooms', roomRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

## 테스트

테스트를 위한 유틸리티 함수가 제공됩니다:

```typescript
import { __testing } from './booking';

// 모든 예약 삭제 (테스트 초기화)
__testing.clearBookings();

// 내부 함수 테스트
const isOverlap = __testing.isTimeOverlap(
  new Date('2025-10-20T10:00:00Z'),
  new Date('2025-10-20T11:00:00Z'),
  new Date('2025-10-20T10:30:00Z'),
  new Date('2025-10-20T11:30:00Z')
);
console.log('시간 겹침:', isOverlap); // true
```

## 향후 개선 사항

현재는 인메모리 저장소를 사용하지만, 실제 프로덕션 환경에서는:

1. **데이터베이스 연동**
   - PostgreSQL, MySQL, MongoDB 등
   - Prisma, TypeORM 등의 ORM 사용

2. **인증/인가**
   - JWT 토큰 검증
   - 사용자 권한 체크

3. **알림 기능**
   - 예약 확인 이메일
   - 예약 시작 전 리마인더

4. **반복 예약**
   - 매주/매월 반복 예약 기능

5. **대기 목록**
   - 예약이 꽉 찬 경우 대기 등록

6. **통계 및 리포트**
   - 회의실 사용률
   - 인기 시간대 분석
