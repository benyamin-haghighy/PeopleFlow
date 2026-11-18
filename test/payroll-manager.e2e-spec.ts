import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ManagerController } from '../src/module/payroll/controllers/payroll-manager.controller';
import { ManagerService } from '../src/module/payroll/service/payroll-manager.service';
import { createE2eApp } from './e2e-support/create-e2e-app';

describe('ManagerController (payroll e2e)', () => {
  let app: INestApplication;
  const managerService = {
    createBaseSalary: jest.fn(),
    createGroup: jest.fn(),
    getGroups: jest.fn(),
    updateGroupBaseSalary: jest.fn(),
    payRollesFilter: jest.fn(),
    getPayrollById: jest.fn(),
    updatePayroll: jest.fn(),
  };

  beforeAll(async () => {
    app = await createE2eApp(ManagerController, ManagerService, managerService);
  });
  afterAll(async () => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('POST /manager/payrolle/base-salary - creates base salary', async () => {
    const dto = { baseSalary: 20000000 };
    const result = { id: 1, ...dto };
    managerService.createBaseSalary.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .post('/api/v1/manager/payrolle/base-salary')
      .set('Authorization', 'Bearer manager-test-token')
      .send(dto)
      .expect(201);

    expect(response.body.data).toEqual(result);
    expect(managerService.createBaseSalary).toHaveBeenCalledWith(dto);
  });

  it('POST /manager/payrolle/base-salary - validates amount', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/manager/payrolle/base-salary')
      .set('Authorization', 'Bearer manager-test-token')
      .send({ baseSalary: 0 })
      .expect(400);
  });

  it('POST /manager/payrolle/groups - creates a group', async () => {
    const dto = { name: 'Junior', baseSalaryId: 1 };
    const result = { id: 2, ...dto };
    managerService.createGroup.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .post('/api/v1/manager/payrolle/groups')
      .set('Authorization', 'Bearer manager-test-token')
      .send(dto)
      .expect(201);

    expect(response.body.data).toEqual(result);
    expect(managerService.createGroup).toHaveBeenCalledWith(dto);
  });

  it('GET /manager/payrolle/groups - returns groups', async () => {
    const result = [{ id: 2, name: 'Junior', baseSalary: { id: 1, baseSalary: 20000000 } }];
    managerService.getGroups.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .get('/api/v1/manager/payrolle/groups')
      .set('Authorization', 'Bearer manager-test-token')
      .expect(200);

    expect(response.body.data).toEqual(result);
  });

  it('PATCH /manager/payrolle/groups/:groupId/base-salary/:baseSalaryId - changes group base salary', async () => {
    const result = { id: 2, baseSalaryId: 3 };
    managerService.updateGroupBaseSalary.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .patch('/api/v1/manager/payrolle/groups/2/base-salary/3')
      .set('Authorization', 'Bearer manager-test-token')
      .expect(200);

    expect(response.body.data).toEqual(result);
    expect(managerService.updateGroupBaseSalary).toHaveBeenCalledWith(2, 3);
  });

  it('PATCH /manager/payrolle/groups/:groupId/base-salary/:baseSalaryId - rejects invalid ids', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/manager/payrolle/groups/x/base-salary/3')
      .set('Authorization', 'Bearer manager-test-token')
      .expect(400);
  });

  it('GET /manager/payrolle - filters payrolls by query parameters', async () => {
    const result = [{ id: 7, totalAmount: 18000000 }];
    managerService.payRollesFilter.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .get('/api/v1/manager/payrolle?startDate=2026-11-01&endDate=2026-11-30&status=PAYED')
      .set('Authorization', 'Bearer manager-test-token')
      .expect(200);

    expect(response.body.data).toEqual(result);
    expect(managerService.payRollesFilter).toHaveBeenCalledWith(
      {
        startDate: '2026-11-01',
        endDate: '2026-11-30',
        status: 'PAYED',
      },
      'PAYED',
    );
  });

  it('GET /manager/payrolle/:id - returns a payroll by id', async () => {
    const result = { id: 7, totalAmount: 18000000 };
    managerService.getPayrollById.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .get('/api/v1/manager/payrolle/7')
      .set('Authorization', 'Bearer manager-test-token')
      .expect(200);

    expect(response.body.data).toEqual(result);
    expect(managerService.getPayrollById).toHaveBeenCalledWith(7);
  });

  it('PATCH /manager/payrolle/:id - updates payroll', async () => {
    const dto = { status: 'PAYED', bonuses: 500000, note: 'Paid' };
    const result = { id: 7, ...dto };
    managerService.updatePayroll.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .patch('/api/v1/manager/payrolle/7')
      .set('Authorization', 'Bearer manager-test-token')
      .send(dto)
      .expect(200);

    expect(response.body.data).toEqual(result);
    expect(managerService.updatePayroll).toHaveBeenCalledWith(7, dto);
  });

  it('PATCH /manager/payrolle/:id - rejects unsupported status', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/manager/payrolle/7')
      .set('Authorization', 'Bearer manager-test-token')
      .send({ status: 'PAID' })
      .expect(400);
    expect(managerService.updatePayroll).not.toHaveBeenCalled();
  });

  it('manager payroll routes - rejects employee role', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/manager/payrolle')
      .set('Authorization', 'Bearer employee-test-token')
      .expect(403);
  });
});
