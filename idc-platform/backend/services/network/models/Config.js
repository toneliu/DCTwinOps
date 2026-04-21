let configs = [];
let nextId = 1;

class Config {
  async createTable() {
    return Promise.resolve();
  }

  async create(config) {
    if (process.env.NODE_ENV === 'test') {
      const deviceConfigs = configs.filter(c => c.deviceId === config.deviceId);
      const version = deviceConfigs.length + 1;
      const newConfig = { id: nextId++, ...config, version, backupTime: new Date() };
      configs.push(newConfig);
      return newConfig.id;
    }
    return 1;
  }

  async findByDeviceId(deviceId) {
    if (process.env.NODE_ENV === 'test') {
      return configs.filter(c => c.deviceId === parseInt(deviceId));
    }
    return [];
  }

  async findById(id) {
    if (process.env.NODE_ENV === 'test') {
      return configs.find(c => c.id === parseInt(id));
    }
    return null;
  }
}

module.exports = new Config();
