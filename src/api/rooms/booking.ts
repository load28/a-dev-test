import {
  Booking,
  BookingStatus,
  CreateBookingRequest,
  CreateBookingResponse,
  CancelBookingRequest,
  CancelBookingResponse,
  BookingValidationError,
} from './types';

// In-memory storage for bookings (실제 환경에서는 데이터베이스 사용)
const bookings: Map<string, Booking> = new Map();

/**
 * 예약 가능 시간을 체크합니다.
 * 운영 시간: 평일 09:00 - 18:00
 */
function isWithinOperatingHours(startTime: Date, endTime: Date): boolean {
  const startHour = startTime.getHours();
  const endHour = endTime.getHours();
  const endMinute = endTime.getMinutes();

  // 평일인지 확인 (0 = 일요일, 6 = 토요일)
  const startDay = startTime.getDay();
  const endDay = endTime.getDay();

  if (startDay === 0 || startDay === 6 || endDay === 0 || endDay === 6) {
    return false; // 주말은 예약 불가
  }

  // 같은 날짜인지 확인
  if (startTime.toDateString() !== endTime.toDateString()) {
    return false; // 다른 날짜는 불가
  }

  // 운영 시간 체크 (09:00 - 18:00)
  const isStartValid = startHour >= 9 && startHour < 18;
  const isEndValid = (endHour < 18) || (endHour === 18 && endMinute === 0);

  return isStartValid && isEndValid;
}

/**
 * 시간이 과거인지 체크합니다.
 */
function isPastTime(time: Date): boolean {
  return time < new Date();
}

/**
 * 최소 예약 시간(30분)을 체크합니다.
 */
function meetsMinimumDuration(startTime: Date, endTime: Date): boolean {
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationMinutes = durationMs / (1000 * 60);
  return durationMinutes >= 30;
}

/**
 * 최대 예약 시간(4시간)을 체크합니다.
 */
function meetsMaximumDuration(startTime: Date, endTime: Date): boolean {
  const durationMs = endTime.getTime() - startTime.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);
  return durationHours <= 4;
}

/**
 * 두 시간 범위가 겹치는지 확인합니다.
 */
function isTimeOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * 중복 예약을 검증합니다.
 * 같은 회의실에 대해 시간이 겹치는 활성 예약이 있는지 확인합니다.
 */
function validateDuplicateBooking(
  roomId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string
): BookingValidationError | null {
  for (const [bookingId, booking] of bookings.entries()) {
    // 취소된 예약은 제외
    if (booking.status === BookingStatus.CANCELLED) {
      continue;
    }

    // 다른 회의실 예약은 제외
    if (booking.roomId !== roomId) {
      continue;
    }

    // 현재 수정 중인 예약은 제외 (수정 시)
    if (excludeBookingId && bookingId === excludeBookingId) {
      continue;
    }

    // 시간 겹침 체크
    if (isTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)) {
      return {
        code: 'DUPLICATE_BOOKING',
        message: `이 시간대에 이미 예약이 존재합니다. (${booking.startTime.toLocaleString()} - ${booking.endTime.toLocaleString()})`,
      };
    }
  }

  return null;
}

/**
 * 예약 가능 시간을 체크합니다.
 */
function validateAvailableTime(
  startTime: Date,
  endTime: Date
): BookingValidationError | null {
  // 1. 과거 시간 체크
  if (isPastTime(startTime)) {
    return {
      code: 'PAST_TIME',
      message: '과거 시간으로 예약할 수 없습니다.',
    };
  }

  // 2. 시작 시간이 종료 시간보다 늦은 경우
  if (startTime >= endTime) {
    return {
      code: 'INVALID_TIME_RANGE',
      message: '시작 시간은 종료 시간보다 빨라야 합니다.',
    };
  }

  // 3. 최소 예약 시간 체크 (30분)
  if (!meetsMinimumDuration(startTime, endTime)) {
    return {
      code: 'MINIMUM_DURATION',
      message: '최소 예약 시간은 30분입니다.',
    };
  }

  // 4. 최대 예약 시간 체크 (4시간)
  if (!meetsMaximumDuration(startTime, endTime)) {
    return {
      code: 'MAXIMUM_DURATION',
      message: '최대 예약 시간은 4시간입니다.',
    };
  }

  // 5. 운영 시간 체크
  if (!isWithinOperatingHours(startTime, endTime)) {
    return {
      code: 'OUTSIDE_OPERATING_HOURS',
      message: '운영 시간(평일 09:00-18:00) 내에만 예약할 수 있습니다.',
    };
  }

  return null;
}

/**
 * POST /api/rooms/:id/book
 * 회의실 예약을 생성합니다.
 */
export async function createBooking(
  roomId: string,
  request: CreateBookingRequest
): Promise<CreateBookingResponse> {
  try {
    // 입력 검증
    if (!roomId || !request.userId || !request.startTime || !request.endTime || !request.title) {
      return {
        success: false,
        error: '필수 정보가 누락되었습니다.',
      };
    }

    const startTime = new Date(request.startTime);
    const endTime = new Date(request.endTime);

    // 날짜 파싱 검증
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return {
        success: false,
        error: '유효하지 않은 날짜 형식입니다.',
      };
    }

    // 예약 가능 시간 검증
    const timeValidation = validateAvailableTime(startTime, endTime);
    if (timeValidation) {
      return {
        success: false,
        error: timeValidation.message,
      };
    }

    // 중복 예약 검증
    const duplicateValidation = validateDuplicateBooking(roomId, startTime, endTime);
    if (duplicateValidation) {
      return {
        success: false,
        error: duplicateValidation.message,
      };
    }

    // 예약 생성
    const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();

    const booking: Booking = {
      id: bookingId,
      roomId,
      userId: request.userId,
      startTime,
      endTime,
      title: request.title,
      description: request.description,
      attendees: request.attendees,
      status: BookingStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    bookings.set(bookingId, booking);

    return {
      success: true,
      booking,
    };
  } catch (error) {
    return {
      success: false,
      error: `예약 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    };
  }
}

/**
 * DELETE /api/rooms/bookings/:bookingId
 * 예약을 취소합니다.
 */
export async function cancelBooking(
  request: CancelBookingRequest
): Promise<CancelBookingResponse> {
  try {
    const { bookingId, userId } = request;

    // 예약 존재 확인
    const booking = bookings.get(bookingId);
    if (!booking) {
      return {
        success: false,
        error: '예약을 찾을 수 없습니다.',
      };
    }

    // 권한 확인 (예약한 사용자만 취소 가능)
    if (booking.userId !== userId) {
      return {
        success: false,
        error: '예약을 취소할 권한이 없습니다.',
      };
    }

    // 이미 취소된 예약 확인
    if (booking.status === BookingStatus.CANCELLED) {
      return {
        success: false,
        error: '이미 취소된 예약입니다.',
      };
    }

    // 예약 취소 (소프트 삭제)
    booking.status = BookingStatus.CANCELLED;
    booking.updatedAt = new Date();

    return {
      success: true,
      message: '예약이 성공적으로 취소되었습니다.',
    };
  } catch (error) {
    return {
      success: false,
      error: `예약 취소 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    };
  }
}

/**
 * GET /api/rooms/:id/bookings
 * 특정 회의실의 예약 목록을 조회합니다.
 */
export async function getRoomBookings(
  roomId: string,
  startDate?: Date,
  endDate?: Date
): Promise<Booking[]> {
  const result: Booking[] = [];

  for (const booking of bookings.values()) {
    // 같은 회의실이고 취소되지 않은 예약만
    if (booking.roomId === roomId && booking.status !== BookingStatus.CANCELLED) {
      // 날짜 필터가 있으면 적용
      if (startDate && endDate) {
        if (booking.startTime >= startDate && booking.endTime <= endDate) {
          result.push(booking);
        }
      } else {
        result.push(booking);
      }
    }
  }

  // 시작 시간 기준으로 정렬
  return result.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
}

/**
 * GET /api/rooms/:id/available-slots
 * 특정 날짜의 예약 가능한 시간대를 조회합니다.
 */
export async function getAvailableTimeSlots(
  roomId: string,
  date: Date
): Promise<{ startTime: Date; endTime: Date }[]> {
  const slots: { startTime: Date; endTime: Date }[] = [];

  // 해당 날짜가 주말인지 확인
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return []; // 주말은 예약 불가
  }

  // 운영 시간: 09:00 - 18:00
  const startHour = 9;
  const endHour = 18;

  // 30분 단위로 시간대 생성
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, minute, 0, 0);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);

      // 18:00을 넘지 않도록
      if (slotEnd.getHours() > endHour || (slotEnd.getHours() === endHour && slotEnd.getMinutes() > 0)) {
        break;
      }

      // 해당 시간대에 예약이 있는지 확인
      const isDuplicate = validateDuplicateBooking(roomId, slotStart, slotEnd);

      if (!isDuplicate) {
        slots.push({ startTime: slotStart, endTime: slotEnd });
      }
    }
  }

  return slots;
}

/**
 * 내보내기: 테스트 및 초기화를 위한 유틸리티 함수
 */
export const __testing = {
  bookings,
  clearBookings: () => bookings.clear(),
  isTimeOverlap,
  validateDuplicateBooking,
  validateAvailableTime,
  isWithinOperatingHours,
};
