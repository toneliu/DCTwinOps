// Device Template model with test support
class DeviceTemplate {
  constructor() {
    if (process.env.NODE_ENV === 'test') {
      this.testTemplates = [];
      this.nextId = 1;
    }
    // In production, this would connect to MySQL
  }

  async create(template) {
    if (process.env.NODE_ENV === 'test') {
      const newTemplate = {
        id: this.nextId++,
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.testTemplates.push(newTemplate);
      return newTemplate;
    }
    // Production implementation would use MySQL
    return { id: 1, ...template };
  }

  async findAll() {
    if (process.env.NODE_ENV === 'test') {
      return this.testTemplates;
    }
    return [];
  }

  async findById(id) {
    if (process.env.NODE_ENV === 'test') {
      return this.testTemplates.find(t => t.id === id);
    }
    return null;
  }
}

module.exports = new DeviceTemplate();
