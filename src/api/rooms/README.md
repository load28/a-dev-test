# Room List API

GET /api/rooms 엔드포인트를 위한 클라이언트 라이브러리입니다.

## 기능

- ✅ 사용자별 예약 룸 필터링
- ✅ 페이지네이션
- ✅ 정렬 기능 (이름, 수용인원, 가격, 생성일, 수정일)
- ✅ 다양한 필터 옵션 (가용성, 수용인원, 위치, 편의시설)
- ✅ 검색 기능 (이름, 설명)
- ✅ JWT 인증 지원
- ✅ Mock 서비스 (개발/테스트용)

## 파일 구조

```
src/api/rooms/
├── index.ts          # 메인 진입점
├── list.ts           # 실제 API 구현
├── list.mock.ts      # Mock API 구현
└── README.md         # 이 파일
```

## 타입 정의

모든 타입은 `src/types/room.ts`에 정의되어 있습니다:

- `Room`: 기본 룸 정보
- `Reservation`: 예약 정보
- `RoomWithReservation`: 예약 정보가 포함된 룸
- `RoomListParams`: API 요청 파라미터
- `RoomListResponse`: API 응답 구조

## 사용 예제

### 1. 기본 사용법

```typescript
import { getRooms } from '@/api/rooms'

// 액세스 토큰 가져오기 (인증 컨텍스트에서)
const accessToken = 'your-jwt-token'

// 기본 요청 (페이지네이션 기본값: page=1, limit=10)
const response = await getRooms({}, accessToken)

console.log(response.data) // 룸 목록
console.log(response.meta) // 페이지네이션 정보
```

### 2. 페이지네이션

```typescript
// 2페이지, 페이지당 20개 항목
const response = await getRooms(
  {
    page: 2,
    limit: 20
  },
  accessToken
)

console.log(response.meta.currentPage)    // 2
console.log(response.meta.totalPages)     // 전체 페이지 수
console.log(response.meta.hasNextPage)    // true/false
```

### 3. 사용자별 예약 룸 필터링

```typescript
// 특정 사용자가 예약한 룸만 조회
const response = await getRooms(
  {
    userId: 'user-123',
    hasReservation: true
  },
  accessToken
)
```

### 4. 정렬

```typescript
// 가격 오름차순 정렬
const response = await getRooms(
  {
    sortBy: 'pricePerHour',
    order: 'asc'
  },
  accessToken
)

// 수용인원 내림차순 정렬
const response = await getRooms(
  {
    sortBy: 'capacity',
    order: 'desc'
  },
  accessToken
)
```

### 5. 필터링

```typescript
// 가용한 룸만 조회
const response = await getRooms(
  {
    isAvailable: true
  },
  accessToken
)

// 수용인원 10명 이상의 룸 조회
const response = await getRooms(
  {
    minCapacity: 10
  },
  accessToken
)

// 특정 위치의 룸 조회
const response = await getRooms(
  {
    location: 'Building A'
  },
  accessToken
)

// 특정 편의시설이 있는 룸 조회
const response = await getRooms(
  {
    amenities: ['Projector', 'WiFi']
  },
  accessToken
)
```

### 6. 검색

```typescript
// 이름이나 설명에 'conference'가 포함된 룸 검색
const response = await getRooms(
  {
    search: 'conference'
  },
  accessToken
)
```

### 7. 복합 쿼리

```typescript
// 여러 조건을 조합
const response = await getRooms(
  {
    isAvailable: true,
    minCapacity: 10,
    maxCapacity: 20,
    location: 'Building A',
    amenities: ['Projector'],
    sortBy: 'pricePerHour',
    order: 'asc',
    page: 1,
    limit: 10
  },
  accessToken
)
```

## Mock 서비스 사용

개발 환경에서 백엔드 없이 테스트하려면 Mock 서비스를 사용하세요:

```typescript
import { getMockRooms } from '@/api/rooms'

// Mock API 사용 (실제 API와 동일한 인터페이스)
const response = await getMockRooms(
  {
    page: 1,
    limit: 10
  },
  'mock-token' // 토큰 검증은 하지 않음
)
```

### Mock 데이터

Mock 서비스는 다음을 제공합니다:
- 6개의 샘플 룸
- 2개의 샘플 예약
- 모든 필터링, 정렬, 페이지네이션 기능
- 500ms API 지연 시뮬레이션

## React 컴포넌트에서 사용

```typescript
import { useEffect, useState } from 'react'
import { getRooms, type RoomListResponse } from '@/api/rooms'
import { useAuth } from '@/hooks/useAuth'

function RoomListPage() {
  const { getAccessToken } = useAuth()
  const [rooms, setRooms] = useState<RoomListResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true)
      setError(null)

      try {
        const token = getAccessToken()
        if (!token) {
          throw new Error('No access token')
        }

        const response = await getRooms(
          {
            page: 1,
            limit: 10,
            isAvailable: true,
            sortBy: 'name',
            order: 'asc'
          },
          token
        )

        setRooms(response)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch rooms')
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [getAccessToken])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!rooms) return null

  return (
    <div>
      <h1>Rooms ({rooms.meta.totalItems})</h1>
      <ul>
        {rooms.data.map(room => (
          <li key={room.id}>
            <h2>{room.name}</h2>
            <p>Capacity: {room.capacity}</p>
            <p>Price: ${room.pricePerHour}/hour</p>
            {room.hasActiveReservation && (
              <span>Reserved</span>
            )}
          </li>
        ))}
      </ul>

      {/* 페이지네이션 */}
      <div>
        <button disabled={!rooms.meta.hasPreviousPage}>
          Previous
        </button>
        <span>Page {rooms.meta.currentPage} of {rooms.meta.totalPages}</span>
        <button disabled={!rooms.meta.hasNextPage}>
          Next
        </button>
      </div>
    </div>
  )
}
```

## 에러 처리

```typescript
import { getRooms, RoomApiError } from '@/api/rooms'

try {
  const response = await getRooms({}, accessToken)
} catch (error) {
  if (error instanceof RoomApiError) {
    console.error('API Error:', error.message)
    console.error('Error Code:', error.code)
    console.error('Details:', error.details)

    // 에러 코드별 처리
    switch (error.code) {
      case 'UNAUTHORIZED':
        // 인증 실패 처리
        break
      case 'FORBIDDEN':
        // 권한 없음 처리
        break
      case 'NOT_FOUND':
        // 리소스 없음 처리
        break
      default:
        // 기타 에러 처리
        break
    }
  }
}
```

## API 응답 구조

### 성공 응답

```typescript
{
  "data": [
    {
      "id": "room-1",
      "name": "Conference Room A",
      "description": "Large conference room with video conferencing equipment",
      "capacity": 20,
      "location": "Building A, Floor 3",
      "amenities": ["Projector", "Whiteboard", "Video Conference", "WiFi"],
      "isAvailable": true,
      "pricePerHour": 50,
      "imageUrl": "https://example.com/room-1.jpg",
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-15T09:00:00Z",
      "hasActiveReservation": false
    }
  ],
  "meta": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 에러 응답

```typescript
{
  "message": "Invalid request parameters",
  "code": "BAD_REQUEST",
  "details": {
    "field": "page",
    "reason": "must be a positive integer"
  }
}
```

## 쿼리 파라미터

| 파라미터 | 타입 | 설명 | 기본값 |
|---------|------|------|--------|
| `page` | number | 페이지 번호 (1부터 시작) | 1 |
| `limit` | number | 페이지당 항목 수 | 10 |
| `userId` | string | 사용자 ID로 필터링 | - |
| `hasReservation` | boolean | 예약 여부로 필터링 | - |
| `isAvailable` | boolean | 가용성으로 필터링 | - |
| `minCapacity` | number | 최소 수용인원 | - |
| `maxCapacity` | number | 최대 수용인원 | - |
| `location` | string | 위치로 필터링 (부분 일치) | - |
| `amenities` | string[] | 편의시설로 필터링 (AND 조건) | - |
| `sortBy` | RoomSortField | 정렬 필드 | - |
| `order` | 'asc' \| 'desc' | 정렬 순서 | 'asc' |
| `search` | string | 이름/설명 검색 | - |

## 정렬 가능한 필드

- `name`: 룸 이름
- `capacity`: 수용인원
- `pricePerHour`: 시간당 가격
- `createdAt`: 생성일
- `updatedAt`: 수정일

## 환경 변수

`.env` 파일에서 API 베이스 URL을 설정할 수 있습니다:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

기본값: `http://localhost:4000/api`

## 백엔드 API 스펙

이 클라이언트는 다음 백엔드 엔드포인트를 기대합니다:

```
GET /api/rooms?page=1&limit=10&userId=user-123&sortBy=name&order=asc
```

**헤더:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**응답:**
- `200 OK`: 성공
- `400 Bad Request`: 잘못된 요청 파라미터
- `401 Unauthorized`: 인증 실패
- `403 Forbidden`: 권한 없음
- `500 Internal Server Error`: 서버 오류

## 테스트

```typescript
import { describe, it, expect } from 'vitest'
import { getMockRooms } from '@/api/rooms'

describe('Room List API', () => {
  it('should return paginated rooms', async () => {
    const response = await getMockRooms({ page: 1, limit: 10 }, 'token')

    expect(response.data).toBeDefined()
    expect(response.meta).toBeDefined()
    expect(response.data.length).toBeLessThanOrEqual(10)
  })

  it('should filter by userId', async () => {
    const response = await getMockRooms(
      { userId: 'user-123', hasReservation: true },
      'token'
    )

    expect(response.data.every(room => room.hasActiveReservation)).toBe(true)
  })

  it('should sort rooms', async () => {
    const response = await getMockRooms(
      { sortBy: 'pricePerHour', order: 'asc' },
      'token'
    )

    const prices = response.data.map(room => room.pricePerHour)
    const sorted = [...prices].sort((a, b) => a - b)
    expect(prices).toEqual(sorted)
  })
})
```

## 라이선스

이 프로젝트의 라이선스를 따릅니다.
