const request = require('supertest');
const app = require('../index');

describe('Auth Service', () => {
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
    // First login to get token
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
