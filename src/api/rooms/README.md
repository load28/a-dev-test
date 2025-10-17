# Room Detail API Service

이 모듈은 룸 상세 정보를 조회하는 프론트엔드 API 클라이언트입니다.

## 기능

- 룸 상세 정보 조회 (인증 필요)
- 룸 상세 정보 공개 조회 (인증 불필요)
- 룸 예약 가능 여부 확인
- 자동 인증 토큰 주입
- 에러 핸들링 및 검증

## 설치 및 Import

```typescript
// 기본 사용
import { roomDetailService } from '@/api/rooms'

// 타입 import
import type { RoomDetail, RoomError } from '@/api/rooms'

// 또는 직접 import
import { roomDetailService } from '@/api/rooms/detail'
```

## API Reference

### `getRoomDetail(roomId: string): Promise<RoomDetail>`

인증된 사용자가 룸의 상세 정보를 조회합니다. 예약 내역이 포함됩니다.

**Parameters:**
- `roomId` (string): 조회할 룸의 고유 ID

**Returns:**
- `Promise<RoomDetail>`: 룸 상세 정보 (시설 정보, 예약 내역 포함)

**Throws:**
- `RoomError`: 요청 실패 시 에러 발생

**Example:**

```typescript
try {
  const roomDetail = await roomDetailService.getRoomDetail('room-123')

  console.log('Room:', roomDetail.name)
  console.log('Price per night:', roomDetail.pricePerNight)
  console.log('Facilities:', roomDetail.facilities)
  console.log('Reservations:', roomDetail.reservations)
} catch (error) {
  if (error instanceof RoomError) {
    console.error('Error:', error.message, 'Status:', error.statusCode)
  }
}
```

### `getRoomDetailPublic(roomId: string): Promise<RoomDetail>`

인증 없이 룸의 공개 정보를 조회합니다. 예약 내역은 포함되지 않습니다.

**Parameters:**
- `roomId` (string): 조회할 룸의 고유 ID

**Returns:**
- `Promise<RoomDetail>`: 룸 상세 정보 (시설 정보만 포함, 예약 내역 제외)

**Example:**

```typescript
const roomDetail = await roomDetailService.getRoomDetailPublic('room-123')
console.log('Public room info:', roomDetail)
```

### `checkRoomAvailability(roomId: string, checkIn: string, checkOut: string)`

특정 기간 동안 룸의 예약 가능 여부를 확인합니다.

**Parameters:**
- `roomId` (string): 조회할 룸의 고유 ID
- `checkIn` (string): 체크인 날짜 (ISO 8601 형식)
- `checkOut` (string): 체크아웃 날짜 (ISO 8601 형식)

**Returns:**
- `Promise<{ available: boolean; conflictingReservations?: string[] }>`

**Example:**

```typescript
const availability = await roomDetailService.checkRoomAvailability(
  'room-123',
  '2025-10-20T14:00:00Z',
  '2025-10-25T11:00:00Z'
)

if (availability.available) {
  console.log('Room is available!')
} else {
  console.log('Room is not available. Conflicts:', availability.conflictingReservations)
}
```

### `createAuthenticatedFetch(): (url: string, options?: RequestInit) => Promise<Response>`

인증 토큰이 자동으로 주입되는 커스텀 fetch 함수를 생성합니다.

**Example:**

```typescript
const authenticatedFetch = roomDetailService.createAuthenticatedFetch()

const response = await authenticatedFetch('http://localhost:4000/api/rooms/room-123/special')
const data = await response.json()
```

## React Component 사용 예제

### 기본 사용 (Functional Component)

```typescript
import React, { useEffect, useState } from 'react'
import { roomDetailService, type RoomDetail, RoomError } from '@/api/rooms'

function RoomDetailPage({ roomId }: { roomId: string }) {
  const [room, setRoom] = useState<RoomDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRoom() {
      try {
        setLoading(true)
        const data = await roomDetailService.getRoomDetail(roomId)
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
  if (!room) return <div>Room not found</div>

  return (
    <div>
      <h1>{room.name}</h1>
      <p>{room.description}</p>
      <p>Price: ${room.pricePerNight} per night</p>
      <p>Capacity: {room.capacity} guests</p>

      <h2>Facilities</h2>
      <ul>
        {room.facilities.map(facility => (
          <li key={facility.id}>{facility.name}</li>
        ))}
      </ul>

      {room.reservations && room.reservations.length > 0 && (
        <>
          <h2>Reservations</h2>
          <ul>
            {room.reservations.map(reservation => (
              <li key={reservation.id}>
                {reservation.userName} - {reservation.checkInDate} to {reservation.checkOutDate}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default RoomDetailPage
```

### TanStack Router 사용 예제

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { roomDetailService } from '@/api/rooms'

export const Route = createFileRoute('/rooms/$roomId')({
  loader: async ({ params }) => {
    const roomDetail = await roomDetailService.getRoomDetail(params.roomId)
    return { roomDetail }
  },
  component: RoomDetailComponent,
})

function RoomDetailComponent() {
  const { roomDetail } = Route.useLoaderData()

  return (
    <div>
      <h1>{roomDetail.name}</h1>
      <p>{roomDetail.description}</p>
      {/* ... */}
    </div>
  )
}
```

## 데이터 타입

### `RoomDetail`

```typescript
interface RoomDetail extends Room {
  facilities: Facility[]
  reservations?: Reservation[]
}
```

### `Room`

```typescript
interface Room {
  id: string
  name: string
  description: string
  type?: 'single' | 'double' | 'suite' | 'deluxe' | 'other'
  capacity: number
  pricePerNight: number
  currency?: string
  imageUrl?: string
  images?: string[]
  isAvailable: boolean
  floor?: number
  size?: number
  bedType?: string
  viewType?: string
  createdAt?: string
  updatedAt?: string
}
```

### `Facility`

```typescript
interface Facility {
  id: string
  name: string
  description?: string
  icon?: string
  category?: 'amenity' | 'service' | 'equipment' | 'other'
}
```

### `Reservation`

```typescript
interface Reservation {
  id: string
  roomId: string
  userId: string
  userName?: string
  userEmail?: string
  checkInDate: string
  checkOutDate: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  guestCount?: number
  totalPrice?: number
  specialRequests?: string
  createdAt: string
  updatedAt: string
}
```

## 에러 핸들링

모든 API 메서드는 실패 시 `RoomError`를 throw합니다.

```typescript
class RoomError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  )
}
```

**주요 에러 코드:**

- `INVALID_ROOM_ID` (400): 잘못된 룸 ID
- `UNAUTHORIZED` (401): 인증 필요
- `INVALID_RESPONSE` (500): 잘못된 응답 형식
- `NETWORK_ERROR` (500): 네트워크 오류

**에러 처리 예제:**

```typescript
try {
  const room = await roomDetailService.getRoomDetail(roomId)
} catch (error) {
  if (error instanceof RoomError) {
    switch (error.statusCode) {
      case 401:
        // Redirect to login
        navigate('/login')
        break
      case 404:
        // Show not found message
        setError('Room not found')
        break
      default:
        setError(error.message)
    }
  }
}
```

## 백엔드 API 요구사항

이 클라이언트는 다음 백엔드 엔드포인트를 예상합니다:

### `GET /api/rooms/:id`

**Headers:**
- `Authorization: Bearer {access_token}`

**Response:**

```json
{
  "room": {
    "id": "room-123",
    "name": "Deluxe Suite",
    "description": "Spacious suite with ocean view",
    "type": "suite",
    "capacity": 4,
    "pricePerNight": 250,
    "currency": "USD",
    "isAvailable": true,
    "facilities": [
      {
        "id": "fac-1",
        "name": "WiFi",
        "description": "High-speed internet",
        "category": "amenity"
      }
    ],
    "reservations": [
      {
        "id": "res-1",
        "roomId": "room-123",
        "userId": "user-456",
        "userName": "John Doe",
        "checkInDate": "2025-10-20T14:00:00Z",
        "checkOutDate": "2025-10-25T11:00:00Z",
        "status": "confirmed"
      }
    ]
  }
}
```

### `GET /api/rooms/:id/public`

인증 없이 공개 정보 조회 (예약 내역 제외)

### `GET /api/rooms/:id/availability?checkIn=...&checkOut=...`

예약 가능 여부 조회

**Response:**

```json
{
  "available": false,
  "conflictingReservations": ["res-1", "res-2"]
}
```

## 환경 변수

`.env` 파일에 다음을 설정하세요:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## 테스트

```typescript
import { describe, it, expect, vi } from 'vitest'
import { roomDetailService, RoomError } from '@/api/rooms'

describe('RoomDetailService', () => {
  it('should fetch room details', async () => {
    const room = await roomDetailService.getRoomDetail('room-123')
    expect(room).toBeDefined()
    expect(room.id).toBe('room-123')
  })

  it('should throw error for invalid room ID', async () => {
    await expect(
      roomDetailService.getRoomDetail('')
    ).rejects.toThrow(RoomError)
  })
})
```

## 라이선스

MIT
