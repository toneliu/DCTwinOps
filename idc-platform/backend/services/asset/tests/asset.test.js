const request = require('supertest');
const app = require('../index');

describe('Asset Service', () => {
  test('should create a new asset', async () => {
    const response = await request(app)
      .post('/api/asset')
      .send({
        name: 'Test Asset',
        type: 'Server',
        status: 'active'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('Test Asset');
  });

  test('should get all assets', async () => {
    const response = await request(app)
      .get('/api/asset');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
