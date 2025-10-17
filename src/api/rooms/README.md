# Room Detail API

룸 상세 정보를 조회하는 API 엔드포인트 구현

## 파일 구조

```
src/
├── api/
│   └── rooms/
│       ├── detail.ts      # GET /api/rooms/:id 엔드포인트 구현
│       └── index.ts       # API exports
├── services/
│   └── roomService.ts     # Room Service 클래스
└── types/
    └── room.ts            # Room 관련 타입 정의
```

## 기능

### GET /api/rooms/:id

룸의 상세 정보를 조회합니다:
- **룸 기본 정보**: 이름, 설명, 수용 인원, 기본 가격 등
- **예약 시간 슬롯**: 사용 가능한 시간대 및 가용성
- **옵션 정보**: 추가 옵션 목록 및 가격

## 사용 방법

### 1. 직접 함수 호출

```typescript
import { getRoomDetail } from '@/api/rooms/detail'

// 인증 없이 조회
const room = await getRoomDetail('room-123')

// 인증 토큰과 함께 조회
const room = await getRoomDetail('room-123', accessToken)

console.log(room.name)              // 룸 이름
console.log(room.reservationTimes)  // 예약 가능 시간
console.log(room.options)           // 룸 옵션
```

### 2. Room Service 사용

```typescript
import { roomService } from '@/services/roomService'

// 싱글톤 인스턴스 사용
const room = await roomService.getRoomDetail('room-123', accessToken)

// 인증 자동 주입 함수 생성
const fetchRoom = roomService.createAuthenticatedFetch(
  () => tokenStorage.getAccessToken()
)

const room = await fetchRoom('room-123')
```

### 3. React 컴포넌트에서 사용

```typescript
import { useEffect, useState } from 'react'
import { roomService } from '@/services/roomService'
import type { RoomDetail } from '@/types/room'
import { RoomError } from '@/types/room'

function RoomDetailPage({ roomId }: { roomId: string }) {
  const [room, setRoom] = useState<RoomDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRoom() {
      try {
        const data = await roomService.getRoomDetail(roomId)
        setRoom(data)
      } catch (err) {
        if (err instanceof RoomError) {
          setError(err.message)
        } else {
          setError('Failed to load room details')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchRoom()
  }, [roomId])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!room) return null

  return (
    <div>
      <h1>{room.name}</h1>
      <p>{room.description}</p>
      <p>Capacity: {room.capacity}</p>
      <p>Base Price: ${room.basePrice}</p>

      <h2>Available Times</h2>
      <ul>
        {room.reservationTimes.map(time => (
          <li key={time.id}>
            {time.startTime} - {time.endTime}
            {time.isAvailable ? ' (Available)' : ' (Booked)'}
          </li>
        ))}
      </ul>

      <h2>Options</h2>
      <ul>
        {room.options.map(option => (
          <li key={option.id}>
            {option.name} - ${option.price}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

## 타입 정의

### RoomDetail

```typescript
interface RoomDetail {
  id: string
  name: string
  description?: string
  capacity: number
  basePrice: number
  imageUrl?: string
  amenities?: string[]
  location?: string
  reservationTimes: ReservationTime[]
  options: RoomOption[]
}
```

### ReservationTime

```typescript
interface ReservationTime {
  id: string
  startTime: string        // ISO 8601 format
  endTime: string          // ISO 8601 format
  isAvailable: boolean
  price?: number
}
```

### RoomOption

```typescript
interface RoomOption {
  id: string
  name: string
  description?: string
  price: number
  isAvailable: boolean
}
```

## 에러 처리

```typescript
import { RoomError, RoomErrorCode } from '@/types/room'

try {
  const room = await getRoomDetail('room-123')
} catch (error) {
  if (error instanceof RoomError) {
    switch (error.code) {
      case RoomErrorCode.NOT_FOUND:
        console.error('Room not found')
        break
      case RoomErrorCode.UNAUTHORIZED:
        console.error('Authentication required')
        break
      case RoomErrorCode.NETWORK_ERROR:
        console.error('Network error')
        break
      default:
        console.error('Unknown error:', error.message)
    }
  }
}
```

## 환경 변수

`.env` 파일에서 API 베이스 URL을 설정할 수 있습니다:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

기본값: `http://localhost:4000/api`

## API 응답 형식

### 성공 응답

```json
{
  "success": true,
  "data": {
    "id": "room-123",
    "name": "Conference Room A",
    "description": "Large conference room with video equipment",
    "capacity": 20,
    "basePrice": 100,
    "imageUrl": "https://example.com/room.jpg",
    "amenities": ["Projector", "Whiteboard", "WiFi"],
    "location": "Building A, Floor 2",
    "reservationTimes": [
      {
        "id": "time-1",
        "startTime": "2025-10-18T09:00:00Z",
        "endTime": "2025-10-18T11:00:00Z",
        "isAvailable": true,
        "price": 100
      }
    ],
    "options": [
      {
        "id": "option-1",
        "name": "Coffee Service",
        "description": "Coffee and tea for attendees",
        "price": 20,
        "isAvailable": true
      }
    ]
  }
}
```

### 에러 응답

```json
{
  "success": false,
  "message": "Room not found"
}
```
