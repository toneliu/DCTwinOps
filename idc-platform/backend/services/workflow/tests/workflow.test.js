const request = require('supertest');
const app = require('../index');

describe('Workflow Service', () => {
  test('should create a new workflow', async () => {
    const response = await request(app)
      .post('/api/workflow')
      .send({
        name: 'Test Workflow',
        description: 'Test workflow description',
        status: 'active'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('Test Workflow');
  });

  test('should get all workflows', async () => {
    const response = await request(app)
      .get('/api/workflow');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
