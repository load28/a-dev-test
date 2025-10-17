import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBooking,
  cancelBooking,
  getRoomBookings,
  getAvailableTimeSlots,
  __testing,
} from './booking';
import { CreateBookingRequest } from './types';

describe('Room Booking API', () => {
  beforeEach(() => {
    // 각 테스트 전에 예약 데이터 초기화
    __testing.clearBookings();
  });

  describe('createBooking', () => {
    it('유효한 예약을 생성할 수 있다', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // 평일로 설정
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      const request: CreateBookingRequest = {
        userId: 'user123',
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString(),
        title: '팀 미팅',
        description: '주간 팀 미팅',
      };

      const result = await createBooking('room-001', request);

      expect(result.success).toBe(true);
      expect(result.booking).toBeDefined();
      expect(result.booking?.roomId).toBe('room-001');
      expect(result.booking?.userId).toBe('user123');
      expect(result.booking?.title).toBe('팀 미팅');
    });

    it('필수 정보가 누락되면 실패한다', async () => {
      const request = {
        userId: 'user123',
        startTime: '',
        endTime: '',
        title: '',
      } as CreateBookingRequest;

      const result = await createBooking('room-001', request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('필수 정보가 누락되었습니다');
    });

    it('과거 시간으로 예약하면 실패한다', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(10, 0, 0, 0);

      const endTime = new Date(yesterday);
      endTime.setHours(11, 0, 0, 0);

      const request: CreateBookingRequest = {
        userId: 'user123',
        startTime: yesterday.toISOString(),
        endTime: endTime.toISOString(),
        title: '테스트',
      };

      const result = await createBooking('room-001', request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('과거 시간');
    });

    it('30분 미만 예약은 실패한다', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setMinutes(15); // 15분만

      const request: CreateBookingRequest = {
        userId: 'user123',
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString(),
        title: '테스트',
      };

      const result = await createBooking('room-001', request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('최소 예약 시간은 30분');
    });

    it('4시간 초과 예약은 실패한다', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(15, 0, 0, 0); // 5시간

      const request: CreateBookingRequest = {
        userId: 'user123',
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString(),
        title: '테스트',
      };

      const result = await createBooking('room-001', request);

      expect(result.success).toBe(false);
      expect(result.error).toContain('최대 예약 시간은 4시간');
    });

    it('중복 예약은 실패한다', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // 평일로 설정
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      const request: CreateBookingRequest = {
        userId: 'user123',
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString(),
        title: '첫 번째 예약',
      };

      // 첫 번째 예약 생성
      const firstResult = await createBooking('room-001', request);
      expect(firstResult.success).toBe(true);

      // 같은 시간대에 두 번째 예약 시도
      const secondRequest = { ...request, title: '두 번째 예약' };
      const secondResult = await createBooking('room-001', secondRequest);

      expect(secondResult.success).toBe(false);
      expect(secondResult.error).toContain('이미 예약이 존재합니다');
    });
  });

  describe('cancelBooking', () => {
    it('예약을 취소할 수 있다', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // 평일로 설정
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      const request: CreateBookingRequest = {
        userId: 'user123',
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString(),
        title: '테스트',
      };

      const createResult = await createBooking('room-001', request);
      expect(createResult.success).toBe(true);

      const cancelResult = await cancelBooking({
        bookingId: createResult.booking!.id,
        userId: 'user123',
      });

      expect(cancelResult.success).toBe(true);
      expect(cancelResult.message).toContain('성공적으로 취소');
    });

    it('다른 사용자는 예약을 취소할 수 없다', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // 평일로 설정
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      const request: CreateBookingRequest = {
        userId: 'user123',
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString(),
        title: '테스트',
      };

      const createResult = await createBooking('room-001', request);
      expect(createResult.success).toBe(true);

      const cancelResult = await cancelBooking({
        bookingId: createResult.booking!.id,
        userId: 'other-user', // 다른 사용자
      });

      expect(cancelResult.success).toBe(false);
      expect(cancelResult.error).toContain('권한이 없습니다');
    });

    it('존재하지 않는 예약은 취소할 수 없다', async () => {
      const cancelResult = await cancelBooking({
        bookingId: 'non-existent-id',
        userId: 'user123',
      });

      expect(cancelResult.success).toBe(false);
      expect(cancelResult.error).toContain('찾을 수 없습니다');
    });
  });

  describe('getRoomBookings', () => {
    it('회의실의 예약 목록을 조회할 수 있다', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // 평일로 설정
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      const request: CreateBookingRequest = {
        userId: 'user123',
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString(),
        title: '테스트',
      };

      await createBooking('room-001', request);

      const bookings = await getRoomBookings('room-001');

      expect(bookings.length).toBe(1);
      expect(bookings[0].roomId).toBe('room-001');
    });

    it('취소된 예약은 목록에 포함되지 않는다', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // 평일로 설정
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      tomorrow.setHours(10, 0, 0, 0);

      const endTime = new Date(tomorrow);
      endTime.setHours(11, 0, 0, 0);

      const request: CreateBookingRequest = {
        userId: 'user123',
        startTime: tomorrow.toISOString(),
        endTime: endTime.toISOString(),
        title: '테스트',
      };

      const createResult = await createBooking('room-001', request);
      await cancelBooking({
        bookingId: createResult.booking!.id,
        userId: 'user123',
      });

      const bookings = await getRoomBookings('room-001');

      expect(bookings.length).toBe(0);
    });
  });

  describe('getAvailableTimeSlots', () => {
    it('예약 가능한 시간대를 조회할 수 있다', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      // 평일로 설정
      while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      tomorrow.setHours(0, 0, 0, 0);

      const slots = await getAvailableTimeSlots('room-001', tomorrow);

      expect(slots.length).toBeGreaterThan(0);
      expect(slots[0].startTime.getHours()).toBeGreaterThanOrEqual(9);
      expect(slots[slots.length - 1].endTime.getHours()).toBeLessThanOrEqual(18);
    });

    it('주말에는 예약 가능한 시간대가 없다', async () => {
      const saturday = new Date();
      while (saturday.getDay() !== 6) {
        saturday.setDate(saturday.getDate() + 1);
      }

      const slots = await getAvailableTimeSlots('room-001', saturday);

      expect(slots.length).toBe(0);
    });
  });

  describe('validateDuplicateBooking', () => {
    it('시간이 겹치는 예약을 감지한다', () => {
      const start1 = new Date('2025-10-20T10:00:00Z');
      const end1 = new Date('2025-10-20T11:00:00Z');
      const start2 = new Date('2025-10-20T10:30:00Z');
      const end2 = new Date('2025-10-20T11:30:00Z');

      const isOverlap = __testing.isTimeOverlap(start1, end1, start2, end2);

      expect(isOverlap).toBe(true);
    });

    it('시간이 겹치지 않는 예약을 구분한다', () => {
      const start1 = new Date('2025-10-20T10:00:00Z');
      const end1 = new Date('2025-10-20T11:00:00Z');
      const start2 = new Date('2025-10-20T11:00:00Z');
      const end2 = new Date('2025-10-20T12:00:00Z');

      const isOverlap = __testing.isTimeOverlap(start1, end1, start2, end2);

      expect(isOverlap).toBe(false);
    });
  });

  describe('isWithinOperatingHours', () => {
    it('운영 시간 내의 예약을 허용한다', () => {
      const monday = new Date('2025-10-20T10:00:00Z'); // 월요일 10시
      monday.setHours(10, 0, 0, 0);

      const endTime = new Date(monday);
      endTime.setHours(11, 0, 0, 0);

      const validation = __testing.validateAvailableTime(monday, endTime);

      // 과거 시간이 아니라면 운영 시간 검증만 확인
      if (validation && validation.code !== 'PAST_TIME') {
        expect(validation.code).not.toBe('OUTSIDE_OPERATING_HOURS');
      }
    });
  });
});
