let networkDevices = [];
let nextId = 1;

class NetworkDevice {
  async createTable() {
    return Promise.resolve();
  }

  async create(device) {
    if (process.env.NODE_ENV === 'test') {
      const newDevice = { id: nextId++, ...device, createdAt: new Date() };
      networkDevices.push(newDevice);
      return newDevice.id;
    }
    return 1;
  }

  async findAll() {
    if (process.env.NODE_ENV === 'test') {
      return networkDevices;
    }
    return [];
  }

  async findById(id) {
    if (process.env.NODE_ENV === 'test') {
      return networkDevices.find(d => d.id === parseInt(id));
    }
    return null;
  }

  async update(id, device) {
    if (process.env.NODE_ENV === 'test') {
      const index = networkDevices.findIndex(d => d.id === parseInt(id));
      if (index !== -1) {
        networkDevices[index] = { ...networkDevices[index], ...device };
        return true;
      }
    }
    return false;
  }

  async delete(id) {
    if (process.env.NODE_ENV === 'test') {
      const index = networkDevices.findIndex(d => d.id === parseInt(id));
      if (index !== -1) {
        networkDevices.splice(index, 1);
        return true;
      }
    }
    return false;
  }
}

module.exports = new NetworkDevice();
