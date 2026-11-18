import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../src/module/auth/auth.controller';
import { AuthService } from '../src/module/auth/auth.service';
import { createE2eApp } from './e2e-support/create-e2e-app';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const authService = {
    register: jest.fn(),
    createManager: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
  };
  const registerDto = {
    name: 'Test Employee',
    phone: '09123456789',
    password: 'StrongPass123',
    groupId: 1,
  };

  beforeAll(async () => {
    app = await createE2eApp(AuthController, AuthService, authService);
  });
  afterAll(async () => app.close());
  beforeEach(() => jest.clearAllMocks());

  it('POST /auth/register - registers a user without authentication', async () => {
    const result = { id: 10, name: registerDto.name, phone: registerDto.phone };
    authService.register.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(registerDto)
      .expect(201);

    expect(response.body.data).toEqual(result);
    expect(authService.register).toHaveBeenCalledWith(registerDto);
  });

  it('POST /auth/register - rejects invalid registration data', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ name: '', phone: '123', password: '123', groupId: '1' })
      .expect(400);
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('POST /auth/create-manager - rejects unauthenticated requests', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/create-manager')
      .send(registerDto)
      .expect(401);
  });

  it('POST /auth/create-manager - rejects an employee', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/create-manager')
      .set('Authorization', 'Bearer employee-test-token')
      .send(registerDto)
      .expect(403);
    expect(authService.createManager).not.toHaveBeenCalled();
  });

  it('POST /auth/create-manager - allows a manager', async () => {
    const result = { id: 11, name: registerDto.name, role: 'MANAGER' };
    authService.createManager.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/create-manager')
      .set('Authorization', 'Bearer manager-test-token')
      .send(registerDto)
      .expect(201);

    expect(response.body.data).toEqual(result);
    expect(authService.createManager).toHaveBeenCalledWith(registerDto);
  });

  it('POST /auth/login - returns the user and access token and sets refresh cookie', async () => {
    const result = {
      user: { id: 2, name: 'Test Employee', phone: registerDto.phone },
      accessToken: 'access-token-value',
      refreshToken: 'refresh-token-value',
    };
    authService.login.mockResolvedValue(result);

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: registerDto.phone, password: registerDto.password })
      .expect(200);

    expect(response.body).toEqual({
      user: result.user,
      accessToken: result.accessToken,
    });
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([expect.stringContaining('refreshToken=')]),
    );
    expect(authService.login).toHaveBeenCalledWith({
      phone: registerDto.phone,
      password: registerDto.password,
    });
  });

  it('POST /auth/login - rejects invalid credentials payload', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ phone: 'bad-phone', password: 'short' })
      .expect(400);
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('POST /auth/refresh/user/:id - rejects a request without a signed refresh cookie', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh/user/2')
      .expect(401);
    expect(authService.refreshToken).not.toHaveBeenCalled();
  });

  it('POST /auth/refresh/user/:id - validates the numeric user id', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh/user/not-a-number')
      .expect(400);
  });
});
