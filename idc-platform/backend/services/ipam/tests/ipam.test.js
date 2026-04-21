const request = require('supertest');
const app = require('../index');
const NetworkSegment = require('../models/NetworkSegment');

describe('IPAM Service', () => {
  beforeEach(() => {
    if (process.env.NODE_ENV === 'test') {
      NetworkSegment.testSegments = [];
      NetworkSegment.nextId = 1;
    }
  });

  test('should create a network segment', async () => {
    const response = await request(app)
      .post('/api/ipam/segments')
      .send({
        name: 'Production Network',
        network: '192.168.1.0',
        netmask: '255.255.255.0',
        gateway: '192.168.1.1',
        vlan: 10,
        department: 'IT'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.name).toBe('Production Network');
  });

  test('should get all network segments', async () => {
    await NetworkSegment.create({ name: 'Segment 1', network: '192.168.1.0' });
    await NetworkSegment.create({ name: 'Segment 2', network: '192.168.2.0' });

    const response = await request(app)
      .get('/api/ipam/segments');
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test('should get a segment by ID', async () => {
    const created = await NetworkSegment.create({
      name: 'Test Segment',
      network: '192.168.3.0'
    });

    const response = await request(app)
      .get(`/api/ipam/segments/${created.id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Test Segment');
  });
});
