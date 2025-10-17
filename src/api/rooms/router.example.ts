/**
 * Express.js 라우터 예제
 *
 * 실제 사용 시에는 Express.js를 설치하고 이 코드를 참고하여 라우터를 구성하세요.
 *
 * 설치: npm install express @types/express
 */

import { Request, Response, Router } from 'express';
import {
  createBooking,
  cancelBooking,
  getRoomBookings,
  getAvailableTimeSlots,
} from './booking';
import { CreateBookingRequest, CancelBookingRequest } from './types';

const router = Router();

/**
 * POST /api/rooms/:id/book
 * 회의실 예약 생성
 *
 * Request Body:
 * {
 *   "userId": "user123",
 *   "startTime": "2025-10-20T10:00:00Z",
 *   "endTime": "2025-10-20T11:00:00Z",
 *   "title": "팀 미팅",
 *   "description": "주간 팀 미팅",
 *   "attendees": ["user1@example.com", "user2@example.com"]
 * }
 */
router.post('/:id/book', async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    const bookingRequest: CreateBookingRequest = req.body;

    const result = await createBooking(roomId, bookingRequest);

    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.',
    });
  }
});

/**
 * DELETE /api/rooms/bookings/:bookingId
 * 예약 취소
 *
 * Request Body:
 * {
 *   "userId": "user123"
 * }
 */
router.delete('/bookings/:bookingId', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    const { userId } = req.body;

    const cancelRequest: CancelBookingRequest = {
      bookingId,
      userId,
    };

    const result = await cancelBooking(cancelRequest);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.',
    });
  }
});

/**
 * GET /api/rooms/:id/bookings
 * 회의실 예약 목록 조회
 *
 * Query Parameters:
 * - startDate: ISO 8601 날짜 (선택)
 * - endDate: ISO 8601 날짜 (선택)
 */
router.get('/:id/bookings', async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const bookings = await getRoomBookings(roomId, startDate, endDate);

    res.status(200).json({
      success: true,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.',
    });
  }
});

/**
 * GET /api/rooms/:id/available-slots
 * 특정 날짜의 예약 가능한 시간대 조회
 *
 * Query Parameters:
 * - date: ISO 8601 날짜 (필수)
 */
router.get('/:id/available-slots', async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    const dateParam = req.query.date as string;

    if (!dateParam) {
      return res.status(400).json({
        success: false,
        error: 'date 파라미터가 필요합니다.',
      });
    }

    const date = new Date(dateParam);

    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        error: '유효하지 않은 날짜 형식입니다.',
      });
    }

    const slots = await getAvailableTimeSlots(roomId, date);

    res.status(200).json({
      success: true,
      date: dateParam,
      availableSlots: slots,
      count: slots.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.',
    });
  }
});

export default router;
