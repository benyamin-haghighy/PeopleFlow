import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ManagerDepartmentController } from '../src/module/department/controllers/department-manager.controller';
import { DepartmentManageService } from '../src/module/department/service/department-manager.service';
import { createE2eApp } from './e2e-support/create-e2e-app';

describe('ManagerDepartmentController (e2e)', () => {
  let app: INestApplication;
  const departmentService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeAll(async () => {
    app = await createE2eApp(ManagerDepartmentController, DepartmentManageService, departmentService);
  });
  afterAll(async () => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('POST /manager-data/departments - creates a department for manager', async () => {
    const dto = { name: 'Human Resources', description: 'HR department' };
    const result = { id: 1, ...dto };
    departmentService.create.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .post('/api/v1/manager-data/departments')
      .set('Authorization', 'Bearer manager-test-token')
      .send(dto)
      .expect(201);

    expect(response.body.data).toEqual(result);
    expect(departmentService.create).toHaveBeenCalledWith(dto);
  });

  it('POST /manager-data/departments - rejects an employee', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/manager-data/departments')
      .set('Authorization', 'Bearer employee-test-token')
      .send({ name: 'Human Resources' })
      .expect(403);
  });

  it('POST /manager-data/departments - validates department name', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/manager-data/departments')
      .set('Authorization', 'Bearer manager-test-token')
      .send({ name: ' ' })
      .expect(400);
    expect(departmentService.create).not.toHaveBeenCalled();
  });

  it('GET /manager-data/departments - returns all departments', async () => {
    const result = [{ id: 1, name: 'Human Resources' }];
    departmentService.findAll.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .get('/api/v1/manager-data/departments')
      .set('Authorization', 'Bearer manager-test-token')
      .expect(200);

    expect(response.body.data).toEqual(result);
  });

  it('GET /manager-data/departments/:id - returns one department', async () => {
    const result = { id: 3, name: 'Finance' };
    departmentService.findOne.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .get('/api/v1/manager-data/departments/3')
      .set('Authorization', 'Bearer manager-test-token')
      .expect(200);

    expect(response.body.data).toEqual(result);
    expect(departmentService.findOne).toHaveBeenCalledWith(3);
  });

  it('GET /manager-data/departments/:id - rejects non-numeric id', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/manager-data/departments/abc')
      .set('Authorization', 'Bearer manager-test-token')
      .expect(400);
  });

  it('PATCH /manager-data/departments/:id - updates a department', async () => {
    const dto = { description: 'Updated description' };
    const result = { id: 3, name: 'Finance', ...dto };
    departmentService.update.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .patch('/api/v1/manager-data/departments/3')
      .set('Authorization', 'Bearer manager-test-token')
      .send(dto)
      .expect(200);

    expect(response.body.data).toEqual(result);
    expect(departmentService.update).toHaveBeenCalledWith(3, dto);
  });

  it('DELETE /manager-data/departments/:id - removes a department', async () => {
    departmentService.remove.mockResolvedValue({ affected: 1 });

    const response = await request(app.getHttpServer())
      .delete('/api/v1/manager-data/departments/3')
      .set('Authorization', 'Bearer manager-test-token')
      .expect(200);

    expect(response.body.data).toEqual({ affected: 1 });
    expect(departmentService.remove).toHaveBeenCalledWith(3);
  });
});
