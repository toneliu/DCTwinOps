const request = require('supertest');
const app = require('../index');

describe('Monitor Service', () => {
  test('should create a new metric', async () => {
    const response = await request(app)
      .post('/api/monitor')
      .send({
        deviceId: 1,
        type: 'cpu',
        value: 75,
        unit: '%'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.deviceId).toBe(1);
  });

  test('should get all metrics', async () => {
    const response = await request(app)
      .get('/api/monitor');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
