const request = require('supertest');
const app = require('../index');
const TwinModel = require('../models/TwinModel');

describe('Digital Twin Service', () => {
  // Clear test data before each test
  beforeEach(() => {
    if (process.env.NODE_ENV === 'test') {
      TwinModel.testModels = [];
      TwinModel.nextId = 1;
    }
  });

  test('should create a new twin model', async () => {
    const response = await request(app)
      .post('/api/twin/models')
      .send({
        name: 'Test Data Center',
        dataCenterId: 1,
        floorId: 0,
        areaId: 0,
        modelData: { test: true }
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('Test Data Center');
    expect(response.body.dataCenterId).toBe(1);
  });

  test('should get all models for a data center', async () => {
    // Create test data
    await TwinModel.create({
      name: 'Model 1',
      dataCenterId: 1,
      modelData: {}
    });
    await TwinModel.create({
      name: 'Model 2',
      dataCenterId: 1,
      modelData: {}
    });
    await TwinModel.create({
      name: 'Model 3',
      dataCenterId: 2,
      modelData: {}
    });

    const response = await request(app)
      .get('/api/twin/models?dataCenterId=1');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
  });

  test('should get a model by ID', async () => {
    const created = await TwinModel.create({
      name: 'Test Model',
      dataCenterId: 1,
      modelData: {}
    });

    const response = await request(app)
      .get(`/api/twin/models/${created._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Test Model');
  });

  test('should update a model', async () => {
    const created = await TwinModel.create({
      name: 'Old Name',
      dataCenterId: 1,
      modelData: {}
    });

    const response = await request(app)
      .put(`/api/twin/models/${created._id}`)
      .send({
        name: 'New Name'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('New Name');
  });

  test('should delete a model', async () => {
    const created = await TwinModel.create({
      name: 'To Be Deleted',
      dataCenterId: 1,
      modelData: {}
    });

    const response = await request(app)
      .delete(`/api/twin/models/${created._id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Model deleted successfully');
  });

  test('should return 404 for non-existent model', async () => {
    const response = await request(app)
      .get('/api/twin/models/non-existent-id');
    expect(response.statusCode).toBe(404);
  });

  test('should return 400 if dataCenterId is missing', async () => {
    const response = await request(app)
      .get('/api/twin/models');
    expect(response.statusCode).toBe(400);
  });
});
