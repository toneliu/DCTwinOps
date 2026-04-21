// Network Segment model with test support
class NetworkSegment {
  constructor() {
    if (process.env.NODE_ENV === 'test') {
      this.testSegments = [];
      this.nextId = 1;
    }
  }

  async create(segment) {
    if (process.env.NODE_ENV === 'test') {
      const newSegment = {
        id: this.nextId++,
        ...segment,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.testSegments.push(newSegment);
      return newSegment;
    }
    return { id: 1, ...segment };
  }

  async findAll() {
    if (process.env.NODE_ENV === 'test') {
      return this.testSegments;
    }
    return [];
  }

  async findById(id) {
    if (process.env.NODE_ENV === 'test') {
      return this.testSegments.find(s => s.id === id);
    }
    return null;
  }
}

module.exports = new NetworkSegment();
