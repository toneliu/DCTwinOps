const request = require('supertest');
const app = require('../index');
const userModel = require('../models/User');

describe('Auth Service', () => {
  // 在每个测试前清理数据
  beforeEach(() => {
    if (process.env.NODE_ENV === 'test') {
      userModel.users = [];
      userModel.nextId = 1;
    }
  });

  test('should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        role: 'admin'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.username).toBe('testuser');
  });

  test('should login with valid credentials', async () => {
    // First register user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        role: 'admin'
      });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeTruthy();
  });

  test('should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword'
      });
    expect(response.statusCode).toBe(401);
  });

  test('should return 400 for existing username', async () => {
    // First register user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        role: 'admin'
      });

    // Try to register same user again
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        role: 'admin'
      });
    expect(response.statusCode).toBe(400);
  });

  test('should get current user info', async () => {
    // First register user
    await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
        name: 'Test User',
        role: 'admin'
      });

    // Then login to get token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    const token = loginResponse.body.token;

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.username).toBe('testuser');
  });

  test('should return 401 for missing token', async () => {
    const response = await request(app)
      .get('/api/auth/me');
    expect(response.statusCode).toBe(401);
  });

  test('should return 401 for invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken');
    expect(response.statusCode).toBe(401);
  });
});
