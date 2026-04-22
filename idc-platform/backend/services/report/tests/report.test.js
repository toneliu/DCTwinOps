const request = require('supertest');
const app = require('../index');

describe('Report Service', () => {
  test('should create a new report', async () => {
    const response = await request(app)
      .post('/api/report')
      .send({
        name: 'Test Report',
        type: 'daily',
        content: 'Test report content'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('Test Report');
  });

  test('should get all reports', async () => {
    const response = await request(app)
      .get('/api/report');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
