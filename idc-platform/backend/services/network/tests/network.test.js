const request = require('supertest');
const app = require('../index');

describe('Network Service', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test';
  });

  test('should create a new network device', async () => {
    const response = await request(app)
      .post('/api/network/devices')
      .send({
        deviceId: 1,
        hostname: 'switch-01',
        ipAddress: '192.168.1.100',
        vendor: 'Cisco',
        model: 'WS-C2960X-24TS-L',
        osVersion: '15.2(2)E8',
        serialNumber: 'FOC12345678',
        status: 'online'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.hostname).toBe('switch-01');
  });

  test('should create a new config backup', async () => {
    const deviceResponse = await request(app)
      .post('/api/network/devices')
      .send({
        deviceId: 1,
        hostname: 'switch-02',
        ipAddress: '192.168.1.101',
        vendor: 'Cisco',
        model: 'WS-C2960X-24TS-L',
        osVersion: '15.2(2)E8',
        serialNumber: 'FOC87654321',
        status: 'online'
      });

    const response = await request(app)
      .post('/api/network/configs')
      .send({
        deviceId: deviceResponse.body.id,
        configData: 'interface GigabitEthernet1/0/1\n switchport mode access\n switchport access vlan 10\n'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.deviceId).toBe(deviceResponse.body.id);
  });
});
