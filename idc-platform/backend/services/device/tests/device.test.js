const request = require('supertest');
const app = require('../index');
const DeviceTemplate = require('../models/DeviceTemplate');

describe('Device Service', () => {
  beforeEach(() => {
    if (process.env.NODE_ENV === 'test') {
      DeviceTemplate.testTemplates = [];
      DeviceTemplate.nextId = 1;
    }
  });

  test('should create a device template', async () => {
    const response = await request(app)
      .post('/api/device/templates')
      .send({
        name: 'Cisco Catalyst 9300',
        category: 'Network Switch',
        vendor: 'Cisco',
        model: 'C9300-48P',
        uHeight: 1,
        portCount: 48,
        powerConsumption: 350
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('Cisco Catalyst 9300');
  });

  test('should get all device templates', async () => {
    await DeviceTemplate.create({ name: 'Template 1', vendor: 'Vendor 1' });
    await DeviceTemplate.create({ name: 'Template 2', vendor: 'Vendor 2' });

    const response = await request(app)
      .get('/api/device/templates');
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test('should get a template by ID', async () => {
    const created = await DeviceTemplate.create({
      name: 'Test Template',
      vendor: 'Test Vendor'
    });

    const response = await request(app)
      .get(`/api/device/templates/${created.id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Test Template');
  });
});
