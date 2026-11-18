import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { EmployeeDepartmentController } from '../src/module/department/controllers/department-employe.controller';
import { DepartmentManageService } from '../src/module/department/service/department-manager.service';
import { createE2eApp } from './e2e-support/create-e2e-app';

describe('EmployeeDepartmentController (e2e)', () => {
  let app: INestApplication;
  const departmentService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeAll(async () => {
    app = await createE2eApp(EmployeeDepartmentController, DepartmentManageService, departmentService);
  });
  afterAll(async () => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('GET /employee/departments - returns departments to employee', async () => {
    const result = [{ id: 1, name: 'Human Resources' }];
    departmentService.findAll.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .get('/api/v1/employee/departments')
      .set('Authorization', 'Bearer employee-test-token')
      .expect(200);

    expect(response.body.data).toEqual(result);
    expect(departmentService.findAll).toHaveBeenCalledTimes(1);
  });

  it('GET /employee/departments - rejects unauthenticated request', async () => {
    await request(app.getHttpServer()).get('/api/v1/employee/departments').expect(401);
  });

  it('GET /employee/departments - rejects manager because route is employee-only', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/employee/departments')
      .set('Authorization', 'Bearer manager-test-token')
      .expect(403);
  });

  it('GET /employee/departments/:id - returns one department', async () => {
    const result = { id: 5, name: 'Finance' };
    departmentService.findOne.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .get('/api/v1/employee/departments/5')
      .set('Authorization', 'Bearer employee-test-token')
      .expect(200);

    expect(response.body.data).toEqual(result);
    expect(departmentService.findOne).toHaveBeenCalledWith(5);
  });

  it('GET /employee/departments/:id - rejects invalid id', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/employee/departments/nope')
      .set('Authorization', 'Bearer employee-test-token')
      .expect(400);
  });
});
