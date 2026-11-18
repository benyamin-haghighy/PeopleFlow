import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { EmployeeController } from '../src/module/payroll/controllers/payrolle-employee.controller';
import { EmployeeService } from '../src/module/payroll/service/payyrole-employee.service';
import { createE2eApp } from './e2e-support/create-e2e-app';

describe('EmployeeController (payroll e2e)', () => {
  let app: INestApplication;
  const employeeService = {
    getPayrollById: jest.fn(),
    getUserPayrolls: jest.fn(),
  };

  beforeAll(async () => {
    app = await createE2eApp(EmployeeController, EmployeeService, employeeService);
  });
  afterAll(async () => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('GET /employee/payrolle - returns the logged-in employee payrolls', async () => {
    const result = [{ id: 4, user_id: 2, totalAmount: 15000000 }];
    employeeService.getUserPayrolls.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .get('/api/v1/employee/payrolle?startDate=2026-11-01&endDate=2026-11-30')
      .set('Authorization', 'Bearer employee-test-token')
      .expect(200);

    expect(response.body.data).toEqual(result);
    expect(employeeService.getUserPayrolls).toHaveBeenCalledWith(2, {
      startDate: '2026-11-01',
      endDate: '2026-11-30',
    });
  });

  it('GET /employee/payrolle - rejects invalid date filter', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/employee/payrolle?startDate=invalid-date')
      .set('Authorization', 'Bearer employee-test-token')
      .expect(400);
    expect(employeeService.getUserPayrolls).not.toHaveBeenCalled();
  });

  it('GET /employee/payrolle/:id - returns a payroll belonging to current employee', async () => {
    const result = { id: 4, user_id: 2, totalAmount: 15000000 };
    employeeService.getPayrollById.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .get('/api/v1/employee/payrolle/4')
      .set('Authorization', 'Bearer employee-test-token')
      .expect(200);

    expect(response.body.data).toEqual(result);
    expect(employeeService.getPayrollById).toHaveBeenCalledWith(4, 2);
  });

  it('GET /employee/payrolle/:id - rejects invalid id', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/employee/payrolle/not-number')
      .set('Authorization', 'Bearer employee-test-token')
      .expect(400);
  });

  it('employee payroll routes - rejects unauthenticated requests', async () => {
    await request(app.getHttpServer()).get('/api/v1/employee/payrolle').expect(401);
  });

  it('employee payroll routes - rejects manager role', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/employee/payrolle')
      .set('Authorization', 'Bearer manager-test-token')
      .expect(403);
  });
});
