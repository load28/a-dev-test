# Room List Service

방 예약 목록을 조회하는 API 서비스입니다. 세션 기반 인증과 캐싱 로직을 포함합니다.

## Features

- GET /api/bookings 엔드포인트 호출
- 세션 기반 인증 (Bearer Token + Session Cookies)
- 5분 캐싱으로 API 호출 최적화
- 에러 핸들링 및 타입 안정성

## Usage

```typescript
import { roomListService } from './services/api/roomList.service'

// Get current user's bookings (uses cache)
const response = await roomListService.getBookings(accessToken)

// Force refresh (bypass cache)
const freshResponse = await roomListService.getBookings(accessToken, {
  forceRefresh: true
})

// Get specific user's bookings
const userResponse = await roomListService.getBookings(accessToken, {
  userId: 'user-123'
})

// Get single booking by ID
const booking = await roomListService.getBookingById(accessToken, 'booking-456')

// Clear cache
roomListService.clearCache() // Clear all
roomListService.clearCache('user-123') // Clear specific user
```

## API Response

```typescript
interface RoomListResponse {
  bookings: Booking[]
  total: number
}

interface Booking {
  id: string
  roomId: string
  room?: Room
  userId: string
  startTime: string
  endTime: string
  status: BookingStatus
  createdAt: string
  updatedAt: string
}
```

## Error Handling

```typescript
import { RoomListError, RoomListErrorCode } from '../../types/roomList'

try {
  const response = await roomListService.getBookings(accessToken)
} catch (error) {
  if (error instanceof RoomListError) {
    switch (error.code) {
      case RoomListErrorCode.UNAUTHORIZED:
        // Handle auth error
        break
      case RoomListErrorCode.NETWORK_ERROR:
        // Handle network error
        break
      // ...
    }
  }
}
```

## Caching

- Cache duration: 5 minutes
- Cache key: `bookings_${userId}` or `bookings_current_user`
- Automatically invalidates expired cache
- Manual cache clearing available

## Integration with Auth

```typescript
import { useAuth } from '../../hooks/useAuth'
import { roomListService } from './services/api/roomList.service'

function MyComponent() {
  const { tokens } = useAuth()

  const loadBookings = async () => {
    if (tokens?.accessToken) {
      const response = await roomListService.getBookings(tokens.accessToken)
      return response.bookings
    }
  }
}
```
