import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AttendanceController } from '../src/module/attendance/controllers/attendance-employee.controller';
import { AttendanceService } from '../src/module/attendance/service/attendance-employee.service';
import { createE2eApp } from './e2e-support/create-e2e-app';

describe('AttendanceController (e2e)', () => {
  let app: INestApplication;
  const attendanceService = {
    checkInTime: jest.fn(),
    checkOutTime: jest.fn(),
    filterAttendance: jest.fn(),
  };

  beforeAll(async () => {
    app = await createE2eApp(AttendanceController, AttendanceService, attendanceService);
  });
  afterAll(async () => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('POST /attendance/checkin - records check-in for authenticated employee', async () => {
    const result = { id: 1, userId: 2, note: 'On time' };
    attendanceService.checkInTime.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .post('/api/v1/attendance/checkin')
      .set('Authorization', 'Bearer employee-test-token')
      .send({ note: 'On time' })
      .expect(201);

    expect(response.body.data).toEqual(result);
    expect(attendanceService.checkInTime).toHaveBeenCalledWith({ note: 'On time' }, 2);
  });

  it('POST /attendance/checkin - rejects unauthenticated request', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/attendance/checkin')
      .send({ note: 'On time' })
      .expect(401);
    expect(attendanceService.checkInTime).not.toHaveBeenCalled();
  });

  it('POST /attendance/checkin - validates note type', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/attendance/checkin')
      .set('Authorization', 'Bearer employee-test-token')
      .send({ note: 123 })
      .expect(400);
    expect(attendanceService.checkInTime).not.toHaveBeenCalled();
  });

  it('GET /attendance/checkout - checks out the authenticated employee', async () => {
    const result = { id: 1, userId: 2, checkOutTime: '2026-11-18T10:00:00.000Z' };
    attendanceService.checkOutTime.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .get('/api/v1/attendance/checkout')
      .set('Authorization', 'Bearer employee-test-token')
      .expect(200);

    expect(response.body.data).toEqual(result);
    expect(attendanceService.checkOutTime).toHaveBeenCalledWith(2);
  });

  it('GET /attendance/checkout - rejects unauthenticated request', async () => {
    await request(app.getHttpServer()).get('/api/v1/attendance/checkout').expect(401);
  });

  it('POST /attendance - filters attendance using body dates', async () => {
    const filter = { startDate: '2026-11-01', endDate: '2026-11-18' };
    const result = [{ id: 1, userId: 2, workDate: '2026-11-10' }];
    attendanceService.filterAttendance.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .post('/api/v1/attendance')
      .set('Authorization', 'Bearer employee-test-token')
      .send(filter)
      .expect(201);

    expect(response.body.data).toEqual(result);
    expect(attendanceService.filterAttendance).toHaveBeenCalledWith(2, filter);
  });

  it('POST /attendance - accepts an ISO timestamp according to the DTO transform during validation', async () => {
    attendanceService.filterAttendance.mockResolvedValue([]);

    await request(app.getHttpServer())
      .post('/api/v1/attendance')
      .set('Authorization', 'Bearer employee-test-token')
      .send({ startDate: '2026-11-01T12:30:00.000Z' })
      .expect(201);

    // The application's main.ts uses new ValidationPipe() without transform: true,
    // so the DTO is used for validation but the original plain request value reaches the controller.
    expect(attendanceService.filterAttendance).toHaveBeenCalledWith(2, {
      startDate: '2026-11-01T12:30:00.000Z',
    });
  });

  it('POST /attendance - rejects an invalid date', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/attendance')
      .set('Authorization', 'Bearer employee-test-token')
      .send({ startDate: 'not-a-date' })
      .expect(400);
    expect(attendanceService.filterAttendance).not.toHaveBeenCalled();
  });
});
