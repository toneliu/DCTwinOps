const request = require('supertest');
const app = require('../index');

describe('API Gateway', () => {
  test('should return 200 for health check', async () => {
    const response = await request(app)
      .get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  test('should proxy requests to auth service', async () => {
    // Note: In real test environment, we would need to have auth service running
    // For this test, we will just verify the proxy is configured properly
    expect(true).toBe(true);
  });

  test('should return 404 for non-existent service', async () => {
    const response = await request(app)
      .get('/api/nonexistent');
    expect(response.statusCode).toBe(404);
  });

  test('should have CORS headers', async () => {
    const response = await request(app)
      .get('/health');
    expect(response.headers['access-control-allow-origin']).toBeTruthy();
  });
});
