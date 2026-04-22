const request = require('supertest');
const app = require('../index');

describe('Plugin Service', () => {
  test('should create a new plugin', async () => {
    const response = await request(app)
      .post('/api/plugin')
      .send({
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'Test plugin description'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('Test Plugin');
  });

  test('should get all plugins', async () => {
    const response = await request(app)
      .get('/api/plugin');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
